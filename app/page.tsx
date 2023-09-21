import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

import GraphForm from "@/components/GraphForm";
import { Button } from "@/components/ui/button";
import Graph from "@/components/Graph";

export default function Home() {
	return (
		<Dialog>
			<DialogTrigger>
				<Button>New Graph</Button>
			</DialogTrigger>
			<DialogContent>
				<GraphForm />
			</DialogContent>
		</Dialog>
	);
}
