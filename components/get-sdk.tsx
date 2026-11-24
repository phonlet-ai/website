import Link from 'next/link';
import { site } from '@/lib/site';
import { RELEASE, installs, releaseUrl } from '@/lib/release';
import { CodeBlock } from './code-block';

/**
 * How to get an SDK: the release with its install command and where the example's model comes
 * from. Without REPO_URL (a local build with no public repository), the contact page instead.
 */
export function GetSdk({ label, slug }: { label: string; slug: string }) {
  if (!site.REPO_URL) {
    return (
      <p>
        <Link href="/contact">Write to us</Link> for the {label} SDK: you get the package, the{' '}
        <code>en-1</code> model and the threshold generator, free for non-commercial use. For a
        product you sell, ask for a commercial licence in the same message.
      </p>
    );
  }
  const install = installs[slug];
  return (
    <>
      <p>
        The {label} SDK, the <code>en-1</code> model and the threshold generator are in release{' '}
        <a href={releaseUrl}>{RELEASE}</a>, free for non-commercial use. For a product you sell,{' '}
        <Link href="/contact">get a commercial licence</Link>.
      </p>
      {install?.command && <CodeBlock code={install.command} title="Terminal" />}
      {install && (
        <p>
          {install.text.split('`').map((part, i) => (i % 2 ? <code key={i}>{part}</code> : part))}
        </p>
      )}
    </>
  );
}
