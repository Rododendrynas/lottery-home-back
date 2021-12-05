CREATE TABLE lucky_numbers (
    id INT AUTO_INCREMENT PRIMARY KEY,
	user_id INT,
    numbers VARCHAR(255),
    reg_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id))