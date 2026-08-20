#!/usr/bin/env python3
"""Ekran goruntusu — Mutter ScreenCast + PipeWire uzerinden tek kare."""
import sys, time, gi
gi.require_version("Gst", "1.0")
from gi.repository import Gst
from op import Op
Gst.init(None)

def grab(out="/tmp/screen.png"):
    op = Op()
    node = op.scs_node
    pipe = Gst.parse_launch(
        f"pipewiresrc path={node} num-buffers=8 ! videoconvert ! pngenc snapshot=true ! filesink location={out}")
    pipe.set_state(Gst.State.PLAYING)
    bus = pipe.get_bus()
    bus.timed_pop_filtered(15*Gst.SECOND, Gst.MessageType.EOS | Gst.MessageType.ERROR)
    pipe.set_state(Gst.State.NULL)
    op.stop()
    return out

if __name__ == "__main__":
    print(grab(sys.argv[1] if len(sys.argv)>1 else "/tmp/screen.png"))
