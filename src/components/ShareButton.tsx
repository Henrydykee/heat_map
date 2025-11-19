import { shareContent } from '../utils/exportUtils';
import './ShareButton.css';

interface ShareButtonProps {
  title: string;
  url: string;
  text?: string;
  variant?: 'icon' | 'button';
}

const ShareButton = ({
  title,
  url,
  text,
  variant = 'icon',
}: ShareButtonProps) => {
  const handleShare = async () => {
    await shareContent(title, url, text);
  };

  if (variant === 'icon') {
    return (
      <button
        className="share-button-icon"
        onClick={handleShare}
        title="Share"
      >
        🔗
      </button>
    );
  }

  return (
    <button className="share-button" onClick={handleShare}>
      🔗 Share
    </button>
  );
};

export default ShareButton;

