import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";
import { redirect, usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

import { createJD } from "@/lib/jd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";

function CreateJDModal({
  showCreateJDModal,
  setShowCreateJDModal,
}: {
  showCreateJDModal: boolean;
  setShowCreateJDModal: Dispatch<SetStateAction<boolean>>;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [creating, setCreating] = useState(false);

  const onCreateJD = async () => {
    setCreating(true);
    createJD({ title, content }).finally(() => setCreating(false));
  };

  return (
    <Modal
      showModal={showCreateJDModal}
      setShowModal={setShowCreateJDModal}
      className="gap-0"
    >
      <div className="flex flex-col space-y-3 border-b p-6 pt-8">
        <h3 className="text-lg font-semibold">Create New Job Description</h3>
        <p className="text-sm text-muted-foreground">
          Fill in the details below to create a new job description.
        </p>
      </div>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          toast.promise(onCreateJD(), {
            loading: "Creating job description...",
            success: () => {
              setShowCreateJDModal(false);
              return "Job description created successfully!";
            },
            error: (err) => err.message || "Failed to create job description",
          });
        }}
        className="flex flex-col space-y-4 bg-accent px-6 py-8 text-left"
      >
        <div>
          <label htmlFor="title" className="mb-1 block text-sm font-medium">
            Job Title
          </label>
          <Input
            type="text"
            name="title"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Senior Software Engineer"
            required
            autoFocus
            className="w-full border bg-background"
          />
        </div>

        <div>
          <label htmlFor="content" className="mb-1 block text-sm font-medium">
            Job Description Content
          </label>
          <Textarea
            name="content"
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter the job description details..."
            required
            rows={8}
            className="w-full border bg-background"
          />
        </div>

        <div className="flex justify-end space-x-2 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowCreateJDModal(false)}
            disabled={creating}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="default"
            disabled={creating || !title || !content}
          >
            {creating ? "Creating..." : "Create Job Description"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function useCreateJDModal() {
  const [showCreateJDModal, setShowCreateJDModal] = useState(false);

  const CreateJDModalCallback = useCallback(() => {
    return (
      <CreateJDModal
        showCreateJDModal={showCreateJDModal}
        setShowCreateJDModal={setShowCreateJDModal}
      />
    );
  }, [showCreateJDModal, setShowCreateJDModal]);

  return useMemo(
    () => ({
      setShowCreateJDModal,
      CreateJDModal: CreateJDModalCallback,
    }),
    [setShowCreateJDModal, CreateJDModalCallback],
  );
}
