import SearchPost from "../components/SearchPost/SearchPost"
import CreatePostButton from '../components/CreatePostButton/CreatePostButton'

const LoadingPosts = () => {
    return (
        <div className="blog-container">
            <h1>BLOG</h1>
            <SearchPost />


            <h2 className='info-word'>  всего заданий: ... </h2>

            {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="post-skeleton">
                    <div className="skeleton-title"></div>
                    <div className="skeleton-line"></div>
                    <div className="skeleton-line"></div>
                    <div className="skeleton-line short"></div>
                </div>
            ))}
        </div>
    )
}

export default LoadingPosts