#!/usr/bin/env python3
"""DXB operator — GNOME Wayland altinda fare/klavye surucusu.
Mutter'in kendi RemoteDesktop + ScreenCast arayuzunu kullanir. Root gerekmez."""
import sys, time, gi
gi.require_version("Gio", "2.0")
from gi.repository import Gio, GLib

BUS = Gio.bus_get_sync(Gio.BusType.SESSION, None)

def proxy(name, path, iface):
    return Gio.DBusProxy.new_sync(BUS, Gio.DBusProxyFlags.NONE, None, name, path, iface, None)

class Op:
    def __init__(self):
        rd = proxy("org.gnome.Mutter.RemoteDesktop", "/org/gnome/Mutter/RemoteDesktop",
                   "org.gnome.Mutter.RemoteDesktop")
        self.sess_path = rd.call_sync("CreateSession", None, 0, -1, None).unpack()[0]
        self.sess = proxy("org.gnome.Mutter.RemoteDesktop", self.sess_path,
                          "org.gnome.Mutter.RemoteDesktop.Session")
        sid = self.sess.get_cached_property("SessionId").unpack()

        sc = proxy("org.gnome.Mutter.ScreenCast", "/org/gnome/Mutter/ScreenCast",
                   "org.gnome.Mutter.ScreenCast")
        scs_path = sc.call_sync("CreateSession",
            GLib.Variant("(a{sv})", ({"remote-desktop-session-id": GLib.Variant("s", sid)},)),
            0, -1, None).unpack()[0]
        self.scs = proxy("org.gnome.Mutter.ScreenCast", scs_path,
                         "org.gnome.Mutter.ScreenCast.Session")
        mon = proxy("org.gnome.Mutter.DisplayConfig", "/org/gnome/Mutter/DisplayConfig",
                    "org.gnome.Mutter.DisplayConfig")
        state = mon.call_sync("GetCurrentState", None, 0, -1, None).unpack()
        self.connector = state[1][0][0][0]
        self.stream_path = self.scs.call_sync("RecordMonitor",
            GLib.Variant("(sa{sv})", (self.connector, {"cursor-mode": GLib.Variant("u", 2)})),
            0, -1, None).unpack()[0]
        # PipeWire akis numarasi Start'tan SONRA sinyalle gelir — once dinle, sonra basla
        self.scs_node = None
        def _on_stream(conn, sender, path, iface, signal, params):
            if signal == "PipeWireStreamAdded":
                self.scs_node = params.unpack()[0]
        BUS.signal_subscribe(None, "org.gnome.Mutter.ScreenCast.Stream",
                             "PipeWireStreamAdded", self.stream_path, None, 0, _on_stream)
        # uzak masaustu oturumunun Start'i ekran akisini da baslatir
        self.sess.call_sync("Start", None, 0, -1, None)
        ctx = GLib.MainContext.default()
        for _ in range(200):
            while ctx.pending(): ctx.iteration(False)
            if self.scs_node is not None: break
            time.sleep(0.05)
        st = proxy("org.gnome.Mutter.ScreenCast", self.stream_path,
                   "org.gnome.Mutter.ScreenCast.Stream")
        pr = st.get_cached_property("Parameters")
        self.stream_params = pr.unpack() if pr else {}

    def move(self, x, y):
        self.sess.call_sync("NotifyPointerMotionAbsolute",
            GLib.Variant("(sdd)", (self.stream_path, float(x), float(y))), 0, -1, None)

    def click(self, button=272):
        for pressed in (True, False):
            self.sess.call_sync("NotifyPointerButton",
                GLib.Variant("(ib)", (button, pressed)), 0, -1, None)
            time.sleep(0.06)

    def key(self, keysym):
        for pressed in (True, False):
            self.sess.call_sync("NotifyKeyboardKeysym",
                GLib.Variant("(ub)", (keysym, pressed)), 0, -1, None)
            time.sleep(0.04)

    def type_text(self, text):
        import unicodedata
        for ch in text:
            ks = ord(ch) if ord(ch) < 0x80 else 0x1000000 + ord(ch)
            self.key(ks); time.sleep(0.02)

    def stop(self):
        try: self.sess.call_sync("Stop", None, 0, -1, None)
        except Exception: pass

if __name__ == "__main__":
    op = Op()
    print("OPERATOR HAZIR — ekran:", op.connector, "| akis:", op.stream_path)
    # gorunur kanit: fareyi ekranda gezdir
    for (x, y) in [(1720,720),(300,200),(3100,200),(3100,1200),(300,1200),(1720,720)]:
        op.move(x, y); print("  fare →", x, y); time.sleep(0.45)
    op.stop()
    print("TAMAM")
