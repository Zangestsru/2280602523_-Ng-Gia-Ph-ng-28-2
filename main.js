//HTTP request get,get/id,post,put/id, delete/id

// ==================== POSTS CRUD ====================

// Lấy max ID từ danh sách posts
async function getMaxPostId() {
    try {
        let res = await fetch('http://localhost:3000/posts');
        let posts = await res.json();
        if (posts.length === 0) return 0;
        let maxId = Math.max(...posts.map(p => parseInt(p.id) || 0));
        return maxId;
    } catch (error) {
        console.log(error);
        return 0;
    }
}

// Load và hiển thị posts
async function LoadData() {
    try {
        let res = await fetch('http://localhost:3000/posts');
        let posts = await res.json();
        let body = document.getElementById("table-body");
        body.innerHTML = "";
        for (const post of posts) {
            // Kiểm tra soft delete - hiển thị gạch ngang nếu isDeleted = true
            let style = post.isDeleted ? "text-decoration: line-through; color: gray;" : "";
            let deleteBtn = post.isDeleted
                ? `<input type='submit' value='restore' onclick='RestorePost(${post.id})'/>`
                : `<input type='submit' value='delete' onclick='DeletePost(${post.id})'/>`;

            body.innerHTML += `<tr style="${style}">
                <td>${post.id}</td>
                <td>${post.title}</td>
                <td>${post.views}</td>
                <td>
                    ${deleteBtn}
                    <input type='submit' value='edit' onclick='EditPost(${post.id})'/>
                </td>
            </tr>`;
        }
        return false;
    } catch (error) {
        console.log(error);
    }
}

// Lưu post (tạo mới hoặc sửa)
async function Save() {
    let id = document.getElementById("id_txt").value;
    let title = document.getElementById("title_txt").value;
    let views = document.getElementById("view_txt").value;

    // Nếu ID trống -> tạo mới với ID tự tăng
    if (!id || id.trim() === "") {
        let maxId = await getMaxPostId();
        let newId = (maxId + 1).toString(); // ID lưu dưới dạng chuỗi

        let res = await fetch('http://localhost:3000/posts', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: newId,
                title: title,
                views: views,
                isDeleted: false
            })
        });
        if (res.ok) {
            console.log("Thêm dữ liệu thành công với ID: " + newId);
        }
    } else {
        // Có ID -> kiểm tra tồn tại để PUT hoặc POST
        let getItem = await fetch("http://localhost:3000/posts/" + id);
        if (getItem.ok) {
            // Có item -> PUT (cập nhật)
            let existingPost = await getItem.json();
            let res = await fetch('http://localhost:3000/posts/' + id, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: id.toString(),
                    title: title,
                    views: views,
                    isDeleted: existingPost.isDeleted || false
                })
            });
            if (res.ok) {
                console.log("Sửa dữ liệu thành công");
            }
        } else {
            // Không có item -> POST (tạo mới với ID chỉ định)
            let res = await fetch('http://localhost:3000/posts', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: id.toString(),
                    title: title,
                    views: views,
                    isDeleted: false
                })
            });
            if (res.ok) {
                console.log("Thêm dữ liệu thành công");
            }
        }
    }

    // Reset form
    document.getElementById("id_txt").value = "";
    document.getElementById("title_txt").value = "";
    document.getElementById("view_txt").value = "";
    LoadData();
}

// Soft delete post (đánh dấu isDeleted = true)
async function DeletePost(id) {
    // Lấy post hiện tại
    let getItem = await fetch("http://localhost:3000/posts/" + id);
    if (getItem.ok) {
        let post = await getItem.json();
        // Cập nhật isDeleted = true
        let res = await fetch('http://localhost:3000/posts/' + id, {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: post.id,
                title: post.title,
                views: post.views,
                isDeleted: true
            })
        });
        if (res.ok) {
            console.log("Xóa mềm thành công");
        }
    }
    LoadData();
}

// Khôi phục post đã xóa mềm
async function RestorePost(id) {
    let getItem = await fetch("http://localhost:3000/posts/" + id);
    if (getItem.ok) {
        let post = await getItem.json();
        let res = await fetch('http://localhost:3000/posts/' + id, {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: post.id,
                title: post.title,
                views: post.views,
                isDeleted: false
            })
        });
        if (res.ok) {
            console.log("Khôi phục thành công");
        }
    }
    LoadData();
}

// Load post để sửa
async function EditPost(id) {
    let getItem = await fetch("http://localhost:3000/posts/" + id);
    if (getItem.ok) {
        let post = await getItem.json();
        document.getElementById("id_txt").value = post.id;
        document.getElementById("title_txt").value = post.title;
        document.getElementById("view_txt").value = post.views;
    }
}

// ==================== COMMENTS CRUD ====================

// Lấy max ID từ danh sách comments
async function getMaxCommentId() {
    try {
        let res = await fetch('http://localhost:3000/comments');
        let comments = await res.json();
        if (comments.length === 0) return 0;
        let maxId = Math.max(...comments.map(c => parseInt(c.id) || 0));
        return maxId;
    } catch (error) {
        console.log(error);
        return 0;
    }
}

// Load và hiển thị comments
async function LoadComments() {
    try {
        let res = await fetch('http://localhost:3000/comments');
        let comments = await res.json();
        let body = document.getElementById("comment-table-body");
        if (!body) return;

        body.innerHTML = "";
        for (const comment of comments) {
            // Kiểm tra soft delete
            let style = comment.isDeleted ? "text-decoration: line-through; color: gray;" : "";
            let deleteBtn = comment.isDeleted
                ? `<input type='submit' value='restore' onclick='RestoreComment(${comment.id})'/>`
                : `<input type='submit' value='delete' onclick='DeleteComment(${comment.id})'/>`;

            body.innerHTML += `<tr style="${style}">
                <td>${comment.id}</td>
                <td>${comment.text}</td>
                <td>${comment.postId}</td>
                <td>
                    ${deleteBtn}
                    <input type='submit' value='edit' onclick='EditComment(${comment.id})'/>
                </td>
            </tr>`;
        }
    } catch (error) {
        console.log(error);
    }
}

// Lưu comment (tạo mới hoặc sửa)
async function SaveComment() {
    let id = document.getElementById("comment_id_txt").value;
    let text = document.getElementById("comment_text_txt").value;
    let postId = document.getElementById("comment_postId_txt").value;

    // Nếu ID trống -> tạo mới với ID tự tăng
    if (!id || id.trim() === "") {
        let maxId = await getMaxCommentId();
        let newId = (maxId + 1).toString();

        let res = await fetch('http://localhost:3000/comments', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: newId,
                text: text,
                postId: postId,
                isDeleted: false
            })
        });
        if (res.ok) {
            console.log("Thêm comment thành công với ID: " + newId);
        }
    } else {
        // Có ID -> kiểm tra tồn tại để PUT hoặc POST
        let getItem = await fetch("http://localhost:3000/comments/" + id);
        if (getItem.ok) {
            let existingComment = await getItem.json();
            let res = await fetch('http://localhost:3000/comments/' + id, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: id.toString(),
                    text: text,
                    postId: postId,
                    isDeleted: existingComment.isDeleted || false
                })
            });
            if (res.ok) {
                console.log("Sửa comment thành công");
            }
        } else {
            let res = await fetch('http://localhost:3000/comments', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: id.toString(),
                    text: text,
                    postId: postId,
                    isDeleted: false
                })
            });
            if (res.ok) {
                console.log("Thêm comment thành công");
            }
        }
    }

    // Reset form
    document.getElementById("comment_id_txt").value = "";
    document.getElementById("comment_text_txt").value = "";
    document.getElementById("comment_postId_txt").value = "";
    LoadComments();
}

// Soft delete comment
async function DeleteComment(id) {
    let getItem = await fetch("http://localhost:3000/comments/" + id);
    if (getItem.ok) {
        let comment = await getItem.json();
        let res = await fetch('http://localhost:3000/comments/' + id, {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: comment.id,
                text: comment.text,
                postId: comment.postId,
                isDeleted: true
            })
        });
        if (res.ok) {
            console.log("Xóa mềm comment thành công");
        }
    }
    LoadComments();
}

// Khôi phục comment đã xóa mềm
async function RestoreComment(id) {
    let getItem = await fetch("http://localhost:3000/comments/" + id);
    if (getItem.ok) {
        let comment = await getItem.json();
        let res = await fetch('http://localhost:3000/comments/' + id, {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: comment.id,
                text: comment.text,
                postId: comment.postId,
                isDeleted: false
            })
        });
        if (res.ok) {
            console.log("Khôi phục comment thành công");
        }
    }
    LoadComments();
}

// Load comment để sửa
async function EditComment(id) {
    let getItem = await fetch("http://localhost:3000/comments/" + id);
    if (getItem.ok) {
        let comment = await getItem.json();
        document.getElementById("comment_id_txt").value = comment.id;
        document.getElementById("comment_text_txt").value = comment.text;
        document.getElementById("comment_postId_txt").value = comment.postId;
    }
}

// Khởi chạy
LoadData();
LoadComments();
