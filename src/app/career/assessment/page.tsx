import type { Metadata } from "next";
import { requireSession } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma";
import { submitCareerAssessmentAction } from "@/lib/actions/assessment";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Career assessment" };

const FIELD_NAME_BY_ORDER: Record<number, string> = {
  0: "interest",
  1: "workStyle",
  2: "technicalComfort",
};

export default async function CareerAssessmentPage() {
  await requireSession();

  const assessment = await prisma.assessment.findFirst({
    where: { type: "CAREER", isActive: true },
    include: { questions: { include: { options: { orderBy: { order: "asc" } } }, orderBy: { order: "asc" } } },
  });

  if (!assessment) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <p>The career assessment isn&apos;t available right now.</p>
      </div>
    );
  }

  const action = submitCareerAssessmentAction.bind(null, assessment.id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl text-[var(--color-text-primary)] sm:text-3xl">{assessment.title}</h1>
      {assessment.description && <p className="mt-2 text-base text-[var(--color-text-secondary)]">{assessment.description}</p>}
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        Your answers shape the suggestions on the next page — there are no right or wrong answers.
      </p>

      <form action={action} className="mt-8 flex flex-col gap-8">
        {assessment.questions.map((question) => {
          const fieldName = FIELD_NAME_BY_ORDER[question.order] ?? `q${question.order}`;
          return (
            <fieldset key={question.id}>
              <legend className="text-base font-medium text-[var(--color-text-primary)]">{question.prompt}</legend>
              <div className="mt-3 flex flex-col gap-2">
                {question.options.map((option) => (
                  <label
                    key={option.id}
                    className="flex cursor-pointer items-center gap-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3 text-sm text-[var(--color-text-secondary)] has-[:checked]:border-[var(--color-accent-decorative)] has-[:checked]:bg-[var(--color-accent-subtle-bg)]"
                  >
                    <input
                      type="radio"
                      name={fieldName}
                      value={option.value}
                      required
                      className="h-4 w-4 accent-[var(--color-accent-text)]"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </fieldset>
          );
        })}

        <Button type="submit" size="lg" className="self-start">
          See my results
        </Button>
      </form>
    </div>
  );
}
