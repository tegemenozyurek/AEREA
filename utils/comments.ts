import type { CommunityComment } from '../types/community';

export function countComments(comments: CommunityComment[]): number {
  return comments.reduce((total, comment) => {
    return total + 1 + countComments(comment.replies ?? []);
  }, 0);
}

export function cloneComments(comments: CommunityComment[]): CommunityComment[] {
  return comments.map((comment) => ({
    ...comment,
    replies: cloneComments(comment.replies ?? []),
  }));
}

export function addReplyToComment(
  comments: CommunityComment[],
  parentId: string,
  reply: CommunityComment,
): CommunityComment[] {
  return comments.map((comment) => {
    if (comment.id === parentId) {
      return {
        ...comment,
        replies: [...(comment.replies ?? []), reply],
      };
    }

    if (comment.replies?.length) {
      return {
        ...comment,
        replies: addReplyToComment(comment.replies, parentId, reply),
      };
    }

    return comment;
  });
}
