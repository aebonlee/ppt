import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../services/chatEditService';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isProcessing: boolean;
}

const SUGGESTIONS = [
  '제목을 바꿔줘',
  '본문 내용을 더 자세하게',
  '표를 추가해줘',
  '핵심 포인트를 강조해줘',
];

const ChatPanel: React.FC<ChatPanelProps> = ({ messages, onSendMessage, isProcessing }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleSuggestion = (suggestion: string) => {
    if (isProcessing) return;
    onSendMessage(suggestion);
  };

  return (
    <div className="chat-panel">
      <div className="chat-panel-header">
        <span>💬</span> 슬라이드 편집
      </div>

      <div className="chat-messages">
        {messages.length === 0 && !isProcessing && (
          <div className="chat-empty">
            <div className="chat-empty-icon">✏️</div>
            <p>현재 슬라이드를 수정하고 싶다면<br />아래 예시를 클릭하거나 직접 입력하세요</p>
            <div className="chat-suggestions">
              {SUGGESTIONS.map((s, i) => (
                <button key={i} className="chat-suggestion" onClick={() => handleSuggestion(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} className={`chat-message ${msg.role}`}>
            {msg.content}
          </div>
        ))}

        {isProcessing && (
          <div className="chat-typing">
            <span /><span /><span />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-area" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="수정 사항을 입력하세요..."
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={isProcessing}
        />
        <button type="submit" disabled={!input.trim() || isProcessing}>
          전송
        </button>
      </form>
    </div>
  );
};

export default ChatPanel;
