import { Link, useLoaderData } from "@remix-run/react";
import { LoaderFunctionArgs } from "@remix-run/server-runtime";
import { getPaginationVariables } from "@shopify/hydrogen";
import { MetaFunction } from "@shopify/remix-oxygen";
import { PaginatedResourceSection } from "~/components/PaginatedResourceSection";
import sanityClient from '../lib/sanityClient';


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

	const articles =  await sanityClient.fetch('*[_type == "article"]')

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
	const { articles } = useLoaderData<typeof loader>();

	return (
	  <div className="blogs">
		<h1>Articles</h1>
		<div className="blogs-grid">
		{(
			articles.map((article) => (
				<div>
					<Link to={`/articles/${article.slug.current}`}>{article.title}</Link>
				</div>
			))
		)}
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
