export type SuggestionStatus = 'pending' | 'reviewing' | 'answered' | 'closed';

export interface SuggestionRecord {
  id:        string;
  title:     string;
  category:  string;
  time:      string;
  desc:      string;
  nick:      string;
  createdAt: string;
  status:    SuggestionStatus;
  replies?:  Array<{
    id:         string;
    body:       string;
    createdAt:  string;
    authorRole: 'admin';
  }>;
}
