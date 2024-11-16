import { useState } from "react";

import type { BurpItem } from "@/types/burp";

export function useSelectedItem() {
    const [selectedItem, setSelectedItem] = useState<BurpItem | null>(null);
    return { selectedItem, setSelectedItem };
}
