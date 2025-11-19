import type { Incident, NewsArticle } from '../types';

export const exportIncidentsToCSV = (incidents: Incident[]): void => {
  const headers = [
    'ID',
    'Title',
    'State',
    'Type',
    'Date',
    'Total Casualties',
    'Christian Casualties',
    'Muslim Casualties',
    'Churches Destroyed',
    'Mosques Destroyed',
    'Source',
    'URL',
  ];

  const rows = incidents.map((incident) => [
    incident.id,
    `"${incident.title.replace(/"/g, '""')}"`,
    incident.location.state,
    incident.type,
    incident.date,
    incident.casualties.total,
    incident.casualties.christians,
    incident.casualties.muslims,
    incident.buildingsDestroyed.churches,
    incident.buildingsDestroyed.mosques,
    `"${incident.source.replace(/"/g, '""')}"`,
    incident.url,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `nigeria-security-incidents-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportArticlesToCSV = (articles: NewsArticle[]): void => {
  const headers = ['Title', 'Source', 'Published Date', 'Description', 'URL'];

  const rows = articles.map((article) => [
    `"${article.title.replace(/"/g, '""')}"`,
    `"${article.source.name.replace(/"/g, '""')}"`,
    article.publishedAt,
    `"${(article.description || '').replace(/"/g, '""')}"`,
    article.url,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `nigeria-security-articles-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const shareContent = async (title: string, url: string, text?: string): Promise<void> => {
  const shareData: ShareData = {
    title,
    text: text || title,
    url,
  };

  if (navigator.share && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData);
    } catch (err) {
      // User cancelled or error occurred
      console.log('Share cancelled or failed');
    }
  } else {
    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    } catch (err) {
      // Fallback: Show URL
      prompt('Copy this link:', url);
    }
  }
};

export const printPage = (): void => {
  window.print();
};

