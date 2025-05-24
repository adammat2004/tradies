import React from 'react'
import PostCard from '../../postCard';

interface Post {
  id: string;
  userId: string;
  comment: string;
  pictures: string[];
  listingId: string;
  createdAt: Date;
}

interface ProjectsPageProps {
  posts: Post[];
}

const ProjectsPage: React.FC<ProjectsPageProps> = ({
  posts
}) => {
  return (
    <div>
      {posts.length > 0 ? (
          <div className="relative p-6 flex flex-col">
              <div className="relative flex flex-col flex-grow">
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {posts.map((post) => (
                          <li key={post.id}>
                              <PostCard 
                                  id={post.id}
                                  comment={post.comment}
                                  createdAt={post.createdAt}
                                  images={post.pictures}
                              />
                          </li>
                      ))}
                  </ul>
              </div>
          </div>
      ) : (
          <p className="text-center text-gray-600 pt-6">No Projects available.</p> // Show message if no posts
      )}   
    </div>
  )
}

export default ProjectsPage