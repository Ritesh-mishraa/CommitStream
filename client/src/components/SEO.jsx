import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords }) => {
  return (
    <Helmet>
      <title>{title ? `${title} | CommitStream` : 'CommitStream | Kanban, Tasks & Merge Conflict Predictor'}</title>
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      {title && <meta property="og:title" content={`${title} | CommitStream`} />}
      {description && <meta property="og:description" content={description} />}
    </Helmet>
  );
};

export default SEO;
