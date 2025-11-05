import React, { useState, useCallback } from 'react';

export type TileBlockProps = {
    image: string;
    title: string;
    subtitle: string;
    detail?: string; // HTML string
};

export const Tile: React.FC<TileBlockProps> = ({ 
  image,
  title,
  subtitle,
  detail
}) => {
  const [open, setOpen] = useState(false);
  const handleToggle = useCallback(() => {
    setOpen(o => !o)
  }, []);
  return (
    <article className={open ? 'active' : ''}>
      <span className="image"><img src={image} alt={title} /></span>
      <header 
        className="major"
        style={{ cursor: 'pointer' }}
        onClick={handleToggle}
      >
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </header>
      {detail && (
        <div
          className="container"
          style={{ display: open ? 'block' : 'none' }}
        >
          <div
            style={{ 
              marginTop: '1rem', 
              color: '#333', 
              fontSize: '1rem', 
              textAlign: 'center' 
            }}
            dangerouslySetInnerHTML={{ __html: detail }}
          />
        </div>
      )}
    </article>
  );
}


export const Tiles: React.FC<{ 
  features: Array<{ title: string; subtitle: string; detail?: string; image: string }> 
}> = ({
  features
}) => (
  <section id="one" className="tiles">
    {features.map((feature, i) => <Tile key={`tile-${i}`} {...feature } /> )}
  </section>
);

export default Tiles;