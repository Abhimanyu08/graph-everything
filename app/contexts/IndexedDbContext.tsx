"use client";
import React, { createContext, useEffect, useState } from "react";

export const IndexedDbContext = createContext<{
	documentDb: IDBDatabase | null;
}>({
	documentDb: null,
});

function IndexedDbContextProvider({ children }: { children: React.ReactNode }) {
	const [documentDb, setDocumentDb] = useState<IDBDatabase | null>(null);

	useEffect(() => {
		let documentDbRequest = indexedDB.open("Graph-everything", 1);

		documentDbRequest.onsuccess = (e) => {
			setDocumentDb((e.target as any).result);
		};

		documentDbRequest.onupgradeneeded = function () {
			let db = documentDbRequest.result;
			if (!db.objectStoreNames.contains("")) {
				const mdObjectStore = db.createObjectStore("tile", {
					keyPath: "timeStamp",
				});
				mdObjectStore.createIndex("noteIndex", "note", {
					unique: false,
				});
				mdObjectStore.createIndex("graphIndex", "graphId", {
					unique: false,
				});
			}
		};
	}, []);

	return (
		<IndexedDbContext.Provider value={{ documentDb }}>
			{children}
		</IndexedDbContext.Provider>
	);
}

export default IndexedDbContextProvider;
