import React from "react";

import { Resume } from "@/lib/schemas";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = { title?: string; resume: Resume };

export const ResumePreview: React.FC<Props> = ({ resume, title }) => {
  if (!resume) return null;

  return (
    <Card className="border-none">
      <CardHeader>
        <CardTitle>Parsed Resume</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {resume.profile && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Profile</h3>
            <p className="text-sm leading-relaxed">{resume.profile}</p>
          </div>
        )}

        {resume.skills?.length ? (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {resume.skills.map((skill, i) =>
                skill ? (
                  <Badge key={i} variant="secondary">
                    {skill}
                  </Badge>
                ) : null,
              )}
            </div>
          </div>
        ) : null}

        {resume.education?.length ? (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Education</h3>
            <div className="space-y-4">
              {resume.education.map((edu, i) => (
                <div key={i} className="rounded-lg border p-4">
                  <div className="font-semibold">{edu?.degree}</div>
                  <div className="text-sm text-muted-foreground">
                    {edu?.school}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {edu?.startDate} - {edu?.endDate}
                  </div>
                  {edu?.description && (
                    <p className="mt-2 text-sm">{edu.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {resume.workExperience?.length ? (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Work Experience</h3>
            <div className="space-y-4">
              {resume.workExperience.map((job, i) => (
                <div key={i} className="rounded-lg border p-4">
                  <div className="font-semibold">
                    {job?.title} @ {job?.company}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {job?.startDate} - {job?.endDate}
                  </div>
                  {job?.description && (
                    <p className="mt-2 text-sm">{job.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {resume.projects?.length ? (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Projects</h3>
            <div className="space-y-4">
              {resume.projects.map((proj, i) => (
                <div key={i} className="rounded-lg border p-4">
                  <div className="font-semibold">{proj?.title}</div>
                  {proj?.description && (
                    <p className="mt-2 text-sm">{proj.description}</p>
                  )}
                  {proj?.technologies && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      <strong>Technologies:</strong> {proj.technologies}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {resume.certifications?.length ? (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Certifications</h3>
            <div className="space-y-2">
              {resume.certifications.map((cert, i) => (
                <div key={i} className="rounded-lg border p-3">
                  <div className="font-medium">
                    {cert?.name} – {cert?.issuer}
                  </div>
                  {cert?.date && (
                    <div className="text-sm text-muted-foreground">
                      {cert.date}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {resume.languages?.length ? (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Languages</h3>
            <div className="flex flex-wrap gap-2">
              {resume.languages.map((lang, i) =>
                lang ? (
                  <Badge key={i} variant="outline">
                    {lang}
                  </Badge>
                ) : null,
              )}
            </div>
          </div>
        ) : null}

        {resume.contact ? (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Contact Information</h3>
            <div className="rounded-lg border p-4">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {resume.contact.name && (
                  <div>
                    <strong>Name:</strong> {resume.contact.name}
                  </div>
                )}
                {resume.contact.email && (
                  <div>
                    <strong>Email:</strong> {resume.contact.email}
                  </div>
                )}
                {resume.contact.phone && (
                  <div>
                    <strong>Phone:</strong> {resume.contact.phone}
                  </div>
                )}
                {resume.contact.location && (
                  <div>
                    <strong>Location:</strong> {resume.contact.location}
                  </div>
                )}
                {resume.contact.linkedin && (
                  <div>
                    <strong>LinkedIn:</strong> {resume.contact.linkedin}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};
