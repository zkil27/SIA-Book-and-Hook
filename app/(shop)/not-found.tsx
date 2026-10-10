import { ButtonLink } from "@/components/ui/primitives";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 pt-20 text-center">
      <p className="sign text-[72px] text-ink">Not on ice</p>
      <p className="mt-3 text-ink-2">That item or page isn&apos;t here. It may have been taken off the board.</p>
      <ButtonLink href="/#catch" variant="tarp" className="mt-8">
        See today&apos;s catch
      </ButtonLink>
    </div>
  );
}
