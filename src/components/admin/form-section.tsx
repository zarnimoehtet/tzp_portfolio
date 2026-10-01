import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function SaveBar({ isSubmitting, isDirty }: { isSubmitting: boolean; isDirty: boolean }) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 flex items-center justify-end gap-3 border-t bg-background/95 px-4 py-3 backdrop-blur md:-mx-8 md:px-8">
      {isDirty && <span className="text-sm text-muted-foreground">Unsaved changes</span>}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : "Save changes"}
      </Button>
    </div>
  );
}
