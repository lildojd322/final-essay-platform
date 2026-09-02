import mysql from 'mysql2/promise'
import { hash } from 'bcryptjs'
import { cache } from 'react'
import crypto from 'crypto'



const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 4000,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {}
}

if (!global.mysqlPool || global.mysqlPool._closed) {
    global.mysqlPool = mysql.createPool(dbConfig)
}

const pool = global.mysqlPool

// posts

export const fetchPostsFromDB = cache(async (limit = 20, offset = 0) => {
    const [rows] = await pool.execute(
        `SELECT posts.*,  
                COALESCE(users.name, 'Deleted User') AS author_name
         FROM posts 
         LEFT JOIN users ON posts.userId = users.id
         ORDER BY posts.id DESC 
         LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`
    )
    return rows
})

export const fetchPostFromDBById = cache(async (id) => {
    const [rows] = await pool.execute(
        `SELECT posts.*, 
                COALESCE(users.name, 'Deleted User') AS author_name
         FROM posts 
         LEFT JOIN users ON posts.userId = users.id 
         WHERE posts.id = ?`,
        [id]
    )
    return rows[0]
})

export const fetchLatestPostFromDB = cache(async () => {
    const [rows] = await pool.execute(
        `SELECT posts.*, 
                COALESCE(users.name, 'Deleted User') AS author_name
         FROM posts 
         LEFT JOIN users ON posts.userId = users.id
         ORDER BY posts.created_at DESC 
         LIMIT 3`
    )
    return rows
})

export const fetchCountPostFromDB = cache(async () => {
    const [rows] = await pool.execute('SELECT COUNT(*) AS count FROM posts')
    return rows[0].count
})

export const fetchCountPostFromDBByKeyword = cache(async (keyword) => {
    const [rows] = await pool.execute('SELECT COUNT(*) AS count FROM posts WHERE title LIKE ?', [`%${keyword}%`])
    return rows[0].count
})

export const getPostsFromDBByKeyword = cache(async (keyword, limit = 20, offset = 0) => {
    const [rows] = await pool.execute(
        `SELECT posts.*, 
                COALESCE(users.name, 'Deleted User') AS author_name
         FROM posts 
         LEFT JOIN users ON posts.userId = users.id
         WHERE posts.title LIKE ? 
         ORDER BY posts.id DESC 
         LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`,
        [`%${keyword}%`]
    )
    return rows
})

export const fetchLatestPostsFromDBById = cache(async (userId) => {
    const [rows] = await pool.execute(
        'SELECT * FROM posts WHERE userId = ? ORDER BY created_at DESC LIMIT 3',
        [userId]
    )
    return rows
})

export async function forwardPostToDB(title, description, email, name, userId) {
    const [result] = await pool.execute(
        'INSERT INTO posts (title, body, author_email, author_name, userId) VALUES (?, ?, ?, ?, ?)',
        [title, description, email, name, userId]
    )
    return { success: true, id: result.insertId }
}

export async function deletePostById(id) {
    await pool.execute('DELETE FROM posts WHERE id = ?', [id])
}

export const fetchCountPostFromDBByUserId = cache(async (userId) => {
    const [rows] = await pool.execute('SELECT COUNT(*) AS count FROM posts WHERE userId = ?', [userId])
    return rows[0].count
})

export const fetchPostsFromDBById = cache(async (userId, limit = 20, offset = 0) => {
    const [rows] = await pool.execute(
        `SELECT * FROM posts 
         WHERE userId = ? 
         ORDER BY created_at DESC 
         LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`,
        [userId]
    )
    return rows
})

export const fetchCountPostFromDBById = cache(async (userId) => {
    const [rows] = await pool.execute(
        `SELECT COUNT(*) AS count FROM posts WHERE userId = ?`,
        [userId]
    )
    return rows[0].count || 0
})




// users

export const getUsersFromDB = cache(async () => {
    const [rows] = await pool.execute('SELECT * FROM users')
    return rows
})

export const getUserFromDBByEmail = cache(async (email) => {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email])
    return rows[0]
})

export const getUserFromDBById = cache(async (id) => {
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id])
    return rows[0]
})

export async function forwardUserToDB(email, password, name) {
    const token = crypto.randomBytes(32).toString('hex')
    const hashedPassword = await hash(password, 10)
    await pool.execute(
        'INSERT INTO users (email, password, name, emailVerified, verificationToken) VALUES (?, ?, ?, null, ?)',
        [email, hashedPassword, name, token]
    )
    return { success: true, token: token }
}

export async function forwardResetTokenToDB(email) {
    const resetToken = crypto.randomBytes(32).toString('hex')
    const result = await pool.execute(
        'UPDATE users SET resetToken = ?, resetToken_createdAt = NOW() WHERE email = ?',
        [resetToken, email]
    )

    if (result.affectedRows === 0) {
        return { success: false, token: null }
    }

    return { success: true, token: resetToken }
}


export async function createGoogleUserInDB({ name, email, image }) {
    await pool.execute(
        'INSERT INTO users (name, email, image, password) VALUES (?, ?, ?, NULL)',
        [name, email, image]
    )
}

export async function updateUserAvatarByEmail(email, url) {
    await pool.execute(
        'UPDATE users SET image = ? WHERE email = ?',
        [url, email]
    )
}


export async function deleteUserById(id) {
    await pool.execute(
        'delete from users where id = ?',
        [id]
    )
}


export const getUserFromDBByResetToken = cache(async (token) => {
    const [rows] = await pool.execute('SELECT * FROM users WHERE resetToken = ?', [token])
    return rows[0]
})

export const deleteResetTokenById = async (id) => {
    await pool.execute('UPDATE users SET resetToken = NULL, resetToken_createdAt = NULL WHERE id = ?', [id])
    return { success: true }
}


export async function deleteExpiredResetTokens() {
    await pool.execute(
        `UPDATE users 
         SET resetToken = NULL, resetToken_createdAt = NULL 
         WHERE resetToken IS NOT NULL 
           AND resetToken_createdAt < DATE_SUB(NOW(), INTERVAL 1 HOUR)`
    )
    return { success: true }
}



export const updateUserPassword = async (password, id) => {
    const hashedPassword = await hash(password, 10)
    await pool.execute('UPDATE users SET password = ?, resetToken = NULL, resetToken_createdAt = NULL WHERE id = ?', [hashedPassword, id])
    return { success: true }
}



export const getUserFromDBByToken = cache(async (token) => {
    const [rows] = await pool.execute('SELECT * FROM users WHERE verificationToken  = ?', [token])
    return rows[0]
})

export const updateUserVerificationToken = cache(async (id) => {
    const [rows] = await pool.execute('UPDATE users SET emailVerified = NOW(),  verificationToken = NULL WHERE id = ?', [id])
    return rows
})


export const deleteExpiredUsers = async () => {
    await pool.execute('DELETE from users WHERE emailVerified IS NULL AND createdAt < NOW() - INTERVAL 1 HOUR ')
    return { success: true }
}

//links

export const getLinksFromDB = cache(async () => {
    const [rows] = await pool.execute('SELECT * FROM links')
    return rows
})





//comments

export const getCommentsFromDBByPostId = cache(async (id) => {
    const [rows] = await pool.execute(
        `SELECT 
            comments.*,
            users.name AS author_name,
            users.image AS author_avatar,
            parent_comment.user_id AS parent_author_id,
            parent_user.name AS parent_author_name
         FROM comments 
         LEFT JOIN users ON comments.user_id = users.id
         LEFT JOIN comments AS parent_comment ON comments.parent_comment_id = parent_comment.comment_id
         LEFT JOIN users AS parent_user ON parent_comment.user_id = parent_user.id
         WHERE comments.post_id = ?
         ORDER BY 
            CASE 
                WHEN comments.parent_comment_id IS NULL THEN comments.comment_id 
                ELSE comments.parent_comment_id 
            END DESC,
            comments.parent_comment_id IS NOT NULL ASC, 
            comments.created_at ASC`,
        [id]
    )
    return rows
})

export const fetchCommentFromDBById = cache(async (comment_id) => {
    const [rows] = await pool.execute(
        `SELECT * FROM comments 
         WHERE comment_id =  ?
         LIMIT 1`,
        [comment_id]
    )


    return rows[0]
})

export const getCountCommentsFromDBByPostId = cache(async (id) => {
    const [rows] = await pool.execute('SELECT COUNT(*) AS count FROM comments WHERE post_id = ?', [id])
    return rows[0]?.count || 0

})

export async function forwardCommentToDB(comment_text, post_id, user_id, parent_comment_id) {
    await pool.execute(
        'INSERT INTO comments (comment_text, post_id, user_id, parent_comment_id) VALUES (?, ?, ?, ?)',
        [comment_text, post_id, user_id, parent_comment_id]
    )
    return { success: true }
}

export async function deleteCommentById(id) {
    await pool.execute('DELETE FROM comments WHERE comment_id = ?', [id])
}

