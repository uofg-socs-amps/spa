"use client";
import { GraduationCapIcon, MailIcon, User2Icon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { cn } from "@/lib/utils";
import { copyToClipboard } from "@/lib/utils/general/copy-to-clipboard";

type ProjectCardProps = {
  title: string;
  student: {
    id: string;
    name: string;
    level: number;
  };
  supervisor: {
    id: string;
    name: string;
    email: string;
  };
};

export function ReaderAllocationCard({
  title,
  student,
  supervisor,
}: ProjectCardProps) {
  return (
    <Card className="w-full max-w-3xl overflow-hidden">
      <CardHeader className="bg-accent p-4">
        <CardTitle className="text-wrap text-xl font-semibold leading-tight">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid gap-2">
          <div className="flex flex-col items-start gap-1">
            <p className="text-sm font-medium text-muted-foreground">
              supervisor
            </p>
            <div className="flex items-center gap-2">
              <User2Icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-base">{supervisor.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <MailIcon className="h-4 w-4 text-muted-foreground" />
              <button
                onClick={() => copyToClipboard(supervisor.email)}
                className={cn(
                  buttonVariants({ variant: "link" }),
                  "h-max truncate px-0 py-0 text-base",
                )}
              >
                {supervisor.email}
              </button>
            </div>
          </div>
          <Separator className="my-2" />
          <div className="flex flex-col items-start gap-1">
            <p className="text-sm font-medium text-muted-foreground">student</p>
            <div className="flex items-center gap-2">
              <GraduationCapIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-base">{student.name}</span>{" "}
              <Badge variant="accent" className="bg-indigo-50 text-indigo-700">
                GUID: {student.id}
              </Badge>{" "}
              <Badge variant="accent">Level {student.level}</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
