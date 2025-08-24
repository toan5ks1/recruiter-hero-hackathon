"use client";

import React, { useState } from "react";
import Link from "next/link";
import { JobDescription } from "@prisma/client";
import {
  ArrowRight,
  Calendar,
  Edit3,
  FileText,
  Plus,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { JDEditModal } from "./jd-edit-modal";
import { useCreateJDModal } from "./jd-modal";

interface JDListProps {
  jds: (JobDescription & {
    _count: {
      cvs: number;
    };
  })[];
  onUpdate?: (updatedJD: JobDescription) => void;
}

export const JDList: React.FC<JDListProps> = ({ jds, onUpdate }) => {
  const { setShowCreateJDModal, CreateJDModal } = useCreateJDModal();
  const [editingJD, setEditingJD] = useState<JobDescription | null>(null);

  if (jds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted">
          <FileText className="size-8 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">No job descriptions yet</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Create your first job description to start analyzing resumes.
        </p>
        <Button onClick={() => setShowCreateJDModal(true)} className="mt-4">
          <Plus className="mr-2 size-4" />
          Create Job Description
        </Button>
        <CreateJDModal />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Your Job Descriptions</h2>
          <p className="text-sm text-muted-foreground">
            Manage and analyze resumes for your job postings
          </p>
        </div>
        <Button onClick={() => setShowCreateJDModal(true)}>
          <Plus className="mr-2 size-4" />
          New Job Description
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {jds.map((jd) => (
          <Card key={jd.id} className="group transition-shadow hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="size-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="truncate text-base">
                      {jd.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Job Description
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="size-4" />
                  <span>Resumes</span>
                </div>
                <Badge variant="secondary">{jd._count.cvs}</Badge>
              </div>

              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="size-4" />
                <span>
                  Created {new Date(jd.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <Link href={`/dashboard/${jd.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <ArrowRight className="mr-2 size-4" />
                    View Dashboard
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingJD(jd)}
                >
                  <Edit3 className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <CreateJDModal />

      {editingJD && (
        <JDEditModal
          jd={editingJD}
          isOpen={!!editingJD}
          onClose={() => setEditingJD(null)}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
};
