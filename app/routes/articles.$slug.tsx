import {PortableText} from '@portabletext/react';
import {Link, useLoaderData} from '@remix-run/react';
import {LoaderFunctionArgs} from '@remix-run/server-runtime';
import {getImageDimensions} from '@sanity/asset-utils';
import urlBuilder from '@sanity/image-url';
import {getPaginationVariables} from '@shopify/hydrogen';
import {MetaFunction} from '@shopify/remix-oxygen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import sanityClient from '../lib/sanityClient';

// Barebones lazy-loaded image component
const SampleImageComponent = ({value, isInline}) => {
  const {width, height} = getImageDimensions(value.asset);
  console.log('width', width);
  console.log('height', height);
  const url = urlBuilder(sanityClient)
    .image(value)
    .width(isInline ? 100 : 800)
    .fit('max')
    .auto('format')
    .url();
  return (
    <img
      src={url}
      alt={value.alt || ' '}
      loading="lazy"
      style={{
        // Display alongside text if image appears inside a block text span
        display: isInline ? 'inline-block' : 'block',

        // Avoid jumping around with aspect-ratio CSS property
        aspectRatio: width / height,
      }}
    />
  );
};

const components = {
  types: {
    image: SampleImageComponent,
  },
};

export const meta: MetaFunction = () => {
  return [{title: `Hydrogen | Blogs`}];
};

export async function loader(args: LoaderFunctionArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({
  context,
  request,
  params,
}: LoaderFunctionArgs) {
  const {slug} = params;

  const article = await sanityClient.fetch(
    `*[_type == "article" && slug.current == $slug][0]`,
    {
      slug,
    },
  );

  return {
    article,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: LoaderFunctionArgs) {
  return {};
}

export default function Articles() {
  const {article} = useLoaderData<typeof loader>();

  return (
    <div className="blogs">
      <div className="prose">
        <img
          src={urlBuilder(sanityClient)
            .image(article.mainImage)
            .width(600)
            .fit('max')
            .auto('format')
            .url()}
          alt=""
          className="aspect-video w-full rounded-2xl bg-gray-100 object-cover sm:aspect-[2/1] lg:aspect-[3/2]"
        />
        <h1>{article.title}</h1>
        <PortableText value={article.body} components={components} />
      </div>
    </div>
  );
}
