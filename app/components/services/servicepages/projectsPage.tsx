'use client';
import { useRouter } from 'next/navigation';
import React from 'react'
import PostCard from '../../postCard';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { FaTrash } from 'react-icons/fa';

interface Post {
  id: string;
  userId: string;
  comment: string;
  pictures: string[];
  listingId: string;
  createdAt: Date;
}
interface ProjectsPageProps {
  listingId: string;
}
const ProjectsPage: React.FC<ProjectsPageProps> = ({
  listingId
}) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    const fetchPosts = async () => {
        try {
            const response = await fetch(`/api/getPostsByListingId?listingId=${listingId}`);
            if (!response.ok) throw new Error("Failed to fetch posts");

            const { data } = await response.json();
            setPosts(data);
            setLoading(false);
        } catch (error) {
            console.error("Fetching posts error", error);
        }
    };

    fetchPosts();
  }, [listingId]);
  const deletePost = async (id: string) => {
    try {
      const response = await fetch(`/api/deletePost?id=${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if(!response.ok){
        throw new Error("Failed to delete post");
      }
      setPosts((prevPosts) => 
        prevPosts.filter((post) => post.id !== id)
      );

      return toast.success("Post Deleted!");
    } catch (error) {
      return console.error("Failed to delete post");
    }
  }
  if(loading){
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    )
  }
  return (
    <div>
      <div>
        {posts.length > 0 ? (
          <div className="relative p-6 flex flex-col">
                <div className="relative flex flex-col flex-grow">
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {posts.map((post) => (
                      <li key={post.id} className="relative bg-white shadow rounded-lg p-4">
                        <PostCard 
                          id={post.id}
                          comment={post.comment}
                          createdAt={post.createdAt}
                          images={post.pictures}
                        />
                        <button 
                          onClick={() => deletePost(post.id)}
                          className="absolute bottom-5 right-5 bg-red-500 text-white p-2 rounded-full shadow-md hover:bg-red-600 transition-transform transform hover:scale-110 flex items-center justify-center"
                        >
                          <FaTrash className="text-lg" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
            </div>
        ) : (
          <p className="text-center text-gray-600 pt-6">No Projects available.</p> // Show message if no posts
        )}   
      </div>
      <div className="flex justify-end mt-6">
          <button 
              className="bg-red-500 text-white px-5 py-3 rounded-lg shadow-md hover:bg-red-600 transition-transform transform hover:scale-105"
              onClick={() => router.push(`/create-post/${listingId}`)}
              >
              Add Post
          </button>
      </div>
    </div>
  )
}

export default ProjectsPage