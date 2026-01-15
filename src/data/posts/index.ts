import type { PostItem } from "@/models";

type PostConfig = Omit<PostItem, "contentHtml"> & {
  contentFile: URL;
};

const postContent = import.meta.glob<string>("./*.html", {
  query: "?raw",
  import: "default",
  eager: true,
});

const postsConfig: PostConfig[] = [
  {
    id: "1",
    slug: "resizing-an-iframe-using-postmessage",
    title: "Resizing an iframe using postMessage",
    publishedAt: "2014-04-17",
    summary:
      "How to keep an embedded iframe height in sync with its parent page by exchanging messages between the host and the child document.",
    contentText:
      "Cross-domain iframe resizing trick that wires a postMessage listener on the host page with a height publisher inside the embedded content.",
    contentFile: new URL("./resizing-an-iframe-using-postmessage.html", import.meta.url),
  },
  {
    id: "2",
    slug: "making-sense-of-deferred-as-a-promise",
    title: "Making sense of $.Deferred as a Promise",
    publishedAt: "2015-03-09",
    summary:
      "Reconciling jQuery's $.Deferred object with the Promise mental model by looking at producer, forwarder, and receiver use cases.",
    contentText:
      "Breakdown of how jQuery implements Promises/A via $.Deferred, with examples that show when to create, forward, or simply consume the promise.",
    contentFile: new URL("./making-sense-of-deferred-as-a-promise.html", import.meta.url),
  },
  {
    id: "3",
    slug: "setting-up-a-chrome-os-virtual-machine-in-virtualbox",
    title: "Setting up a Chrome OS VM in VirtualBox",
    publishedAt: "2017-08-12",
    summary:
      "It's really easy to setup a virtual machine instance of ChromeOS for testing and configuration before making the financial commitment (albeit small) to a cutting edge Chromebook.",
    contentText:
      "Step-by-step walkthrough for creating a Chrome OS (CloudReady) virtual machine in VirtualBox, from recovery media to boot settings.",
    contentFile: new URL("./setting-up-a-chrome-os-virtual-machine-in-virtualbox.html", import.meta.url),
  },
];

export async function loadPosts(): Promise<PostItem[]> {
  return postsConfig.map(({ contentFile: _, id, ...post }) => {
    const slug = post.slug ?? id;
    const contentHtml = postContent[`./${slug}.html`];
    if (!contentHtml) {
      throw new Error(`Missing content file for post "${slug}"`);
    }
    return { ...post, id, slug, contentHtml };
  });
}
