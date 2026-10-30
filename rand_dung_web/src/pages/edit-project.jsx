import { useEffect, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/App.jsx";
import { RequireVerifiedUser } from "@/components/require-verified-user";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const GENERATION_TYPES = ["placeholder", "placeholder2"];
const CONFIRMATION_PHRASE = "delete my data";

function GenerationTypeCard() {
    const [generationType, setGenerationType] = useState(GENERATION_TYPES[0]);
    const [pendingGenerationType, setPendingGenerationType] = useState(null);
    const [confirmationText, setConfirmationText] = useState("");

    function cancelChange() {
        setPendingGenerationType(null);
        setConfirmationText("");
    }

    function confirmChange() {
        if (confirmationText !== CONFIRMATION_PHRASE) return;

        setGenerationType(pendingGenerationType);
        cancelChange();
    }

    return (
        <>
            <Card className="w-full max-w-xl p-5">
                <CardHeader>
                    <CardTitle>Dungeon Generation Type</CardTitle>
                    <CardDescription>Choose how this project’s dungeon will be generated.</CardDescription>
                    <div className="mt-4 flex flex-col gap-2">
                        <Label htmlFor="generation-type">Generation type</Label>
                        <select
                            id="generation-type"
                            className="h-10 w-fit min-w-[300px] max-w-full overflow-hidden text-ellipsis whitespace-nowrap rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                            value={generationType}
                            onChange={(event) => {
                                const nextType = event.target.value;
                                if (nextType !== generationType) {
                                    setPendingGenerationType(nextType);
                                    setConfirmationText("");
                                }
                            }}
                        >
                            {GENERATION_TYPES.map((type) => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                </CardHeader>
            </Card>

            {pendingGenerationType && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) cancelChange();
                    }}
                >
                    <div
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="generation-warning-title"
                        aria-describedby="generation-warning-description"
                        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-slate-900 shadow-2xl"
                    >
                        <div className="mb-4 flex size-11 items-center justify-center rounded-full bg-red-100 text-red-700" aria-hidden="true">
                            <span className="text-xl font-bold">!</span>
                        </div>
                        <h2 id="generation-warning-title" className="text-lg font-semibold">
                            Change dungeon generation type?
                        </h2>
                        <p id="generation-warning-description" className="mt-2 text-sm leading-6 text-slate-600">
                            Changing the generation type will erase all dungeon data for this project. This action cannot be undone.
                        </p>

                        <div className="mt-5 flex flex-col gap-2">
                            <Label htmlFor="delete-confirmation">
                                Type <span className="font-mono">{CONFIRMATION_PHRASE}</span> to continue
                            </Label>
                            <Input
                                id="delete-confirmation"
                                autoFocus
                                autoComplete="off"
                                value={confirmationText}
                                onChange={(event) => setConfirmationText(event.target.value)}
                                placeholder={CONFIRMATION_PHRASE}
                            />
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <Button type="button" variant="outline" onClick={cancelChange}>
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                disabled={confirmationText !== CONFIRMATION_PHRASE}
                                onClick={confirmChange}
                            >
                                Confirm change
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function EditProjectCard({ projectName }) {
    const [projectState, setProjectState] = useState({ status: "loading" });

    useEffect(() => {
        let active = true;

        async function loadProject() {
            const uid = auth.currentUser?.uid;
            if (!uid) return;

            try {
                const projectSnapshot = await getDoc(doc(db, `users/${uid}/projects/${projectName}`));
                if (active) {
                    setProjectState(projectSnapshot.exists()
                        ? { status: "found", project: projectSnapshot.data() }
                        : { status: "not-found" });
                }
            } catch {
                if (active) setProjectState({ status: "error" });
            }
        }

        loadProject();
        return () => {
            active = false;
        };
    }, [projectName]);

    if (projectState.status === "not-found") {
        return <Navigate to="/dashboard" replace />;
    }

    const project = projectState.project;
    const description = projectState.status === "loading"
        ? "Loading project…"
        : projectState.status === "error"
            ? "Unable to load this project. Please try again."
            : project.description;
    const title = project?.title ?? projectName;

    return (
        <div className="w-full flex flex-col items-center gap-6 p-10">
            <Card className="w-full max-w-xl p-5">
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
            </Card>
            <GenerationTypeCard />
        </div>
    );
}

export function EditProject({ user, authLoading }) {
    const [searchParams] = useSearchParams();
    const projectName = searchParams.get("project");

    if (!projectName?.trim()) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <RequireVerifiedUser user={user} authLoading={authLoading}>
            <EditProjectCard projectName={projectName} />
        </RequireVerifiedUser>
    );
}
