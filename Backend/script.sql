CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL NOT NULL,
    image_url VARCHAR(255),
    especificaciones TEXT,
    modelo VARCHAR(255),
    resenas TEXT,
    userid INTEGER NOT NULL,
    date TIMESTAMP NOT NULL
);

INSERT INTO posts (name, description, price, image_url, especificaciones, modelo, resenas, userid, date) VALUES
('Micrófono Condensador "ProSound 5000"', 'Micrófono profesional ideal para grabación en estudio, con patrón cardioide y tecnología de reducción de ruido.', 260000, 'Microphone_Elvis.jpg', 'Patrón cardioide, frecuencia de respuesta 20Hz-20kHz, cable de 2 metros incluido.', 'PS5000', 'Excelente calidad de sonido, ideal para grabaciones profesionales. 5/5 estrellas.', 1, '2025-01-15 10:30:00'),
('Monitor de Estudio "StudioPro X5"', 'Altavoces de monitoreo profesional, con graves potentes y agudos nítidos para un sonido claro y preciso en grabaciones.', 530000, 'Mixer_Macks.jpg', 'Bajo de 5 pulgadas, rango de frecuencia 50Hz-20kHz, potencia de 75W.', 'SPX5', 'Gran precisión de sonido, perfectos para la mezcla en estudio. 4.8/5 estrellas.', 2, '2025-01-03 14:45:00'),
('Guitarra Eléctrica "RockMaster 200"', 'Guitarra eléctrica de alto rendimiento con cuerpo sólido y pastillas humbucker para un sonido potente.', 415000, 'GT_Electrica.jpeg', 'Cuerpo de aliso, mástil de arce, 22 trastes, pastillas humbucker.', 'RM200', 'Excelente tono y facilidad para tocar, muy cómoda. 4.7/5 estrellas.', 3, '2025-01-22 09:15:00'),
('Teclado MIDI "MidiPro 88"', 'Teclado MIDI profesional con 88 teclas sensibles al tacto y controladores personalizables para una creación musical fluida.', 380000, 'Keyboard_piano.jpg', '88 teclas, 16 pads de percusión, 8 controles deslizantes, puerto USB.', 'MP88', 'Perfecto para productores y compositores. 4.9/5 estrellas.', 1, '2025-01-10 16:20:00'),
('Piano Digital "ClaviSound 1000"', 'Piano digital con 88 teclas ponderadas, sonidos de piano acústico y 200 estilos de acompañamiento.', 999990, 'piano.webp', '88 teclas ponderadas, 200 voces, 128 efectos, salida MIDI.', 'CS1000', 'Suena muy realista, ideal para músicos de todos los niveles. 4.6/5 estrellas.', 2, '2025-01-28 11:00:00'),
('Amplificador de Guitarra "AmpMaster 50"', 'Amplificador para guitarra eléctrica de 50W con distorsión y efectos integrados para un sonido versátil.', 220500, 'GT_Electrica.jpeg', 'Potencia de 50W, 2 canales, efectos digitales, entrada auxiliar.', 'AM50', 'Sonido potente y versátil, ideal para ensayos y presentaciones. 4.7/5 estrellas.', 3, '2025-01-08 13:30:00'),
('Bajo Eléctrico "BassPro 500"', 'Bajo eléctrico con cuerpo de fresno y pastillas activas para un sonido profundo y cálido.', 500000, 'Bass.jpeg', 'Cuerpo de fresno, 4 cuerdas, pastillas activas, diapasón de palisandro.', 'BP500', 'Gran sonido y versatilidad. Perfecto para tocar en banda. 4.8/5 estrellas.', 1, '2025-01-18 17:10:00'),
('Interfaz de Audio "SoundLink Pro"', 'Interfaz de audio USB de 2 entradas y 2 salidas, perfecta para grabaciones caseras o en estudio.', 120000, 'DJ_Mixer.jpg', '2 entradas XLR, 2 salidas RCA, 48V phantom power, compatible con Windows y Mac.', 'SLPro', 'Fácil de usar y de buena calidad. Ideal para grabaciones caseras. 4.6/5 estrellas.', 2, '2025-01-05 12:00:00'),
('Batería Electrónica "BeatDrum 300"', 'Batería electrónica de 7 piezas con pads sensibles al tacto y múltiples sonidos pre-programados.', 900000, 'Headphones_Sutik.jpg', '7 pads sensibles al tacto, 500 sonidos, conexión MIDI, incluidos pedal de bombo y hi-hat.', 'BD300', 'Perfecta para practicar sin ruido. Muy realista en cuanto a respuesta. 4.8/5 estrellas.', 3, '2025-01-25 15:20:00'),
('Sintetizador "WaveSynth 202"', 'Sintetizador polifónico con 61 teclas y una amplia variedad de sonidos para producción musical moderna.', 490000, 'Keyboard_piano.jpg', '61 teclas, 256 voces, 128 sonidos pre-programados, entradas y salidas MIDI.', 'WS202', 'Sonidos fantásticos para crear música electrónica. 4.7/5 estrellas.', 1, '2025-01-12 14:00:00');

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

INSERT INTO users (name, email, password) VALUES
('Juan Perez', 'juan.perez@example.com', '$2b$10$tYU8QMTbjI9KqHc7MEbymuKvO.fZLhgV21QA3FkHJwdkuB1zGSZSW'),
('Maria Lopez', 'maria.lopez@example.com', '$2b$10$3aELwf7xNNncZdhz.rvH2OvoSyIi9Z12kr1r9NgMx1iTv3FKcKmFK'),
('Carlos Ramirez', 'carlos.ramirez@example.com', '$2b$10$BpI5iWtGeu634QEFF4N83ePiMhhRtEUW4UE/pGkQrAmb.gDygB5gC');

CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    post_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (post_id) REFERENCES posts(id)
);

INSERT INTO favorites (user_id, post_id) VALUES
(1, 3),  
(1, 7),  
(2, 1),  
(2, 9),  
(2, 5),  
(3, 2),  
(3, 8),  
(3, 4),  
(1, 10), 
(2, 6); 