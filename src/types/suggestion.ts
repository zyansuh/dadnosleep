export type SuggestionStatus = 'pending' | 'reviewing' | 'answered' | 'closed';

export interface SuggForm {
  title:    string;
  category: string;
  time:     string;
  desc:     string;
  nick:     string;
}

export interface SuggestionComment {
  id:        string;
  body:      string;
  nick:      string;
  createdAt: string;
  isAdmin?:  boolean;
}

/** @deprecated replies → comments 로 이전. 읽기 시 normalizeComments 가 변환 */
export interface SuggestionReply {
  id:         string;
  body:       string;
  createdAt:  string;
  authorRole: 'admin';
}

export interface SavedSuggestion extends SuggForm {
  id:        string;
  createdAt: string;
  status:    SuggestionStatus;
  comments?: SuggestionComment[];
  replies?:  SuggestionReply[];
}
