DROP TABLE IF EXISTS locations; 

CREATE TABLE IF NOT EXISTS locations(
    id SERIAL PRIMARY KEY,
    city_name VARCHAR(255),
    display_name VARCHAR(255),
    latitude VARCHAR(255),
    longitude VARCHAR(255)
); 
