DROP PROCEDURE IF EXISTS stp_upsertMainRecord;

DELIMITER //
CREATE PROCEDURE stp_upsertMainRecord
	(IN
		pTypeID INT UNSIGNED,
		pCode VARCHAR(45),
		OUT pID INT UNSIGNED
	)
	BEGIN

		SET pCode = TRIM(pCode);

		SELECT COALESCE(MAX(mare.mare_id), 0)
		INTO pID
			FROM main_record AS mare
			JOIN main_record_value AS mava
			  ON mava.mava_fk_entity = mare.mare_id
			WHERE mare_fk_type = pTypeID
			 AND (pCode = '' OR mava_value = pCode);

		IF pID != 0 THEN

			UPDATE main_record SET mare_modified_on = CURRENT_TIMESTAMP() WHERE mare_id = pID;

		ELSE
			INSERT INTO main_record VALUES (0, pTypeID, CURRENT_TIMESTAMP(), 'system', NULL, NULL);
			SET pID = LAST_INSERT_ID();

			INSERT INTO main_record_value
			VALUES
			(
				0 		AS mava_id,
				pID 	AS mava_fk_entity,
				2 		AS mava_fk_type,
				1		AS mava_fk_language,
				NULL	AS mava_fk_value,
				pCode	AS mava_value;
			);

		END IF;

	END //
DELIMITER ;
