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
