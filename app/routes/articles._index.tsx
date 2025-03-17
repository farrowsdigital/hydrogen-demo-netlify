import {Link, useLoaderData} from '@remix-run/react';
import {LoaderFunctionArgs} from '@remix-run/server-runtime';
import {getPaginationVariables} from '@shopify/hydrogen';
import {MetaFunction} from '@shopify/remix-oxygen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import sanityClient from '../lib/sanityClient';
import urlBuilder from '@sanity/image-url';

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
async function loadCriticalData({context, request}: LoaderFunctionArgs) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 10,
  });

  const articles = await sanityClient.fetch(`*[_type == "article"]{
    ...,
    author-> // expand reference to include author's data
  }`);

  return {
    articles,
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
  const {articles} = useLoaderData<typeof loader>();
console.log(articles);
  return (
    <div className="blogs">
      <h1>Articles</h1>
      <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
        {articles.map((article) => (
          <article key={article.id} className="flex flex-col">
            <div className="relative">
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
            </div>
            <div className="flex flex-col items-start justify-between flex-1  max-w-xl">
              <div>
				<div className="mt-8 gap-x-4 text-xs">
				  <time dateTime="2020-03-16" className="text-gray-500">
					Mar 16, 2020
				  </time>
				</div>
				<div className="group relative">
				  <h3 className="mt-3 text-lg/6 font-semibold text-gray-900 group-hover:text-gray-600">
					<Link to={`/articles/${article.slug.current}`}>
					  <span className="absolute inset-0"></span>
					  {article.title}
					</Link>
				  </h3>
				  <p className="mt-5 line-clamp-3 text-sm/6 text-gray-600">
					{article.introduction}
				  </p>
				</div>
			  </div>
              <div className="relative mt-8 flex items-center gap-x-4">
                <img
                  src={urlBuilder(sanityClient)
					.image(article.author.image)
					.width(100)
					.height(100)
					.fit('max')
					.auto('format')
					.url()}
                  alt=""
                  className="size-10 rounded-full bg-gray-100"
                />
                <div className="text-sm/6">
                  <p className="font-semibold text-gray-900">
                    <a href="#">
                      <span className="absolute inset-0"></span>
                      { article.author.name }
                    </a>
                  </p>
                  <p className="text-gray-600">{ article.author.title }</p>
                </div>
              </div>
            </div>
          </article>
        ))}
        {/* <PaginatedResourceSection connection={articles}>
			{({node: blog}) => (
			  <Link
				className="blog"
				key={blog.handle}
				prefetch="intent"
				to={`/blogs/${blog.handle}`}
			  >
				<h2>{blog.title}</h2>
			  </Link>
			)}
		  </PaginatedResourceSection> */}
      </div>
    </div>
  );
}
