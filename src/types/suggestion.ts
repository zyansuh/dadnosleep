export type SuggestionStatus = 'pending' | 'reviewing' | 'answered' | 'closed';

export interface SuggForm {
  title:    string;
  category: string;
  time:     string;
  desc:     string;
  nick:     string;
}

/** 추후 관리자 답변 기능용 */
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
  replies?:  SuggestionReply[];
}
