
import { fetchPostsFromDB, getPostsFromDBByKeyword, fetchCountPostFromDB, fetchCountPostFromDBByKeyword, fetchPostsFromDBById, fetchCountPostFromDBById } from '../../../lib/db'
import SearchPost from '../../../components/SearchPost/SearchPost'
import PostsList from '../../../components/PostsList/PostsList'
import CreatePostButton from '../../../components/CreatePostButton/CreatePostButton'
export const metadata = {
    title: "blog",
}


const Blog = async ({ searchParams }) => {

    const { search = '', userId = '', name } = await searchParams
    const keyword = search


    let posts
    if (userId) {
        posts = await fetchPostsFromDBById(userId)
    } else if (keyword) {
        posts = await getPostsFromDBByKeyword(keyword)
    } else {
        posts = await fetchPostsFromDB()
    }

    let countPosts
    if (userId) {
        countPosts = await fetchCountPostFromDBById(userId)
    } else if (keyword) {
        countPosts = await fetchCountPostFromDBByKeyword(keyword)
    } else {
        countPosts = await fetchCountPostFromDB()
    }

    let infoWord
    if (name) {
        infoWord = `${name} задания:`
    } else if (keyword) {
        infoWord = 'найдено заданий:'
    } else {
        infoWord = 'всего заданий: '
    }

    return (
        <div className='blog-container'>


            {!userId && <SearchPost />}
            {!userId && <CreatePostButton />}

            <h2 className='info-word'>  {infoWord} {countPosts} </h2>

            <PostsList userId={userId} key={`${keyword}-${userId || ''}`} initialPosts={posts} keyword={keyword} />
        </div>
    )
}

export default Blog