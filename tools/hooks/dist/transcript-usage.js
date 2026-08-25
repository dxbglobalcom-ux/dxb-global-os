import { createInterface } from "node:readline";
import { createReadStream } from "node:fs";
export async function sumTranscript(path) {
    const perModel = new Map();
    const lines = createInterface({ input: createReadStream(path), crlfDelay: Infinity });
    for await (const line of lines) {
        let obj;
        try {
            obj = JSON.parse(line);
        }
        catch {
            continue;
        }
        if (obj?.type !== "assistant")
            continue;
        const model = obj.message?.model;
        const usage = obj.message?.usage;
        if (!model || !usage)
            continue;
        const totals = perModel.get(model) ?? { prompt: 0, completion: 0, cacheRead: 0, turns: 0 };
        // What was SENT on this request: the uncached remainder plus what was
        // written into the cache. Both are new text. Cache READS are the same text
        // being re-read and are counted separately — see UsageTotals above.
        totals.prompt += (usage.input_tokens ?? 0) + (usage.cache_creation_input_tokens ?? 0);
        totals.cacheRead += usage.cache_read_input_tokens ?? 0;
        totals.completion += usage.output_tokens ?? 0;
        totals.turns += 1;
        perModel.set(model, totals);
    }
    return perModel;
}
