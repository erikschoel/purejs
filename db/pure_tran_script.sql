DROP PROCEDURE IF EXISTS stp_startTransaction;
DELIMITER //
CREATE PROCEDURE stp_startTransaction(OUT pID INT UNSIGNED)
	BEGIN

		INSERT INTO sys_transaction VALUES (0, CONNECTION_ID());
        SET pID = LAST_INSERT_ID();
        
        START TRANSACTION;

	END //
DELIMITER ;

DROP PROCEDURE IF EXISTS stp_commitTransaction;
DELIMITER //
CREATE PROCEDURE stp_commitTransaction
	(IN pTranID INT UNSIGNED)
	BEGIN

        DECLARE tableName VARCHAR(64) DEFAULT 0;
        DECLARE tableID INT UNSIGNED DEFAULT 0;
        DECLARE done TINYINT UNSIGNED DEFAULT 0;

		DECLARE crsr CURSOR FOR SELECT sytl_table_name, sytl_table_id FROM sys_transaction_log WHERE sytl_fk_transaction = pTranID;
		DECLARE CONTINUE HANDLER FOR SQLSTATE '02000' SET done = 1;

		OPEN crsr;
		REPEAT
			FETCH crsr INTO tableName, tableID;
			IF NOT done THEN

				IF tableName = 'main_record' THEN

					UPDATE main_record SET mare_modified_on = CURRENT_TIMESTAMP() WHERE mare_id = tableID;

					INSERT INTO sys_record_data
                    (syrd_id, syrd_fk_record, syrd_fk_language, syrd_invariant, syrd_data)
						VALUES
					(0, tableID, func_getDimensionID('sys.lang.nl'), UNIX_TIMESTAMP(), func_getRecordData(tableID, func_getDimensionID('sys.lang.nl')))
                    ON DUPLICATE KEY UPDATE syrd_invariant = VALUES(syrd_invariant), syrd_data = VALUES(syrd_data);
                
                END IF;

			END IF;
		UNTIL done END REPEAT;
		CLOSE crsr;

		COMMIT;

		DELETE FROM sys_transaction_log WHERE sytl_fk_transaction = pTranID;
        DELETE FROM sys_transaction WHERE sytr_id = pTranID;

	END //
DELIMITER ;

