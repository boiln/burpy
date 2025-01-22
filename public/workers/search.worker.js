import Fuse from 'fuse.js';

let fuse;
let items = [];

self.onmessage = (e) => {
    const { type, payload } = e.data;
    console.log("Worker received message:", type);

    switch (type) {
        case "initialize":
            items = payload;
            console.log("Initializing Fuse with", items.length, "items");
            fuse = new Fuse(items, {
                keys: [
                    "time",
                    "url",
                    "host.value",
                    "host.ip",
                    "port",
                    "protocol",
                    "method",
                    "path",
                    "extension",
                    "status",
                    "responselength",
                    "mimetype",
                    "comment",
                    "request.decodedValue",
                    "response.decodedValue",
                ],
                threshold: 0.3,
                ignoreLocation: true,        // Search entire content, not just beginning
                minMatchCharLength: 3,       // Minimum characters to match
                shouldSort: true,            // Sort results by relevance
            });
            self.postMessage({ type: "initialized" });
            break;

        case "search":
            if (!fuse) {
                console.error("Fuse not initialized");
                self.postMessage({ type: "error", payload: "Fuse not initialized" });
                return;
            }
            const query = payload;
            console.log("Searching for:", query);
            const results = !query ? items : fuse.search(query).map((result) => result.item);
            console.log("Found", results.length, "results");
            self.postMessage({ type: "searchResults", payload: results });
            break;
    }
}; 