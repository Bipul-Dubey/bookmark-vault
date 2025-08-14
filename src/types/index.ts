export interface IBookmark {
  id: string;
  title: string;
  url: string;
  notes?: string;
  tags: string[];
  favorite: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface IBookmarkStats {
  totalBookmarks: number;
  favoriteBookmarksCount: number;
  uniqueTagsCount: number;
  recentBookmarksCount: number;
  averageTagsPerBookmark: number;
  maxTagsOnSingleBookmark: number;
  mostRecentBookmark?: IBookmark | null;
}
