USE purejs_db;

DROP PROCEDURE IF EXISTS stp_upsertMainEntity;

DELIMITER //
CREATE PROCEDURE stp_upsertMainEntity
	(IN
		pType VARCHAR(45),
		pCode VARCHAR(45),
		OUT pID INT UNSIGNED
	)
	BEGIN

		DECLARE TypeID INT UNSIGNED DEFAULT 0;
        
        SET TypeID = COALESCE((
			SELECT mava_fk_entity
				FROM main_record_value AS mava
			WHERE mava.mava_fk_type =
				(SELECT mava_fk_entity FROM main_record_value WHERE mava_fk_type = 1 AND mava_value = 'ENTI')
			AND mava.mava_value = pType), 0);

		IF TypeID > 0 THEN

			CALL stp_upsertMainRecord(TypeID, pCode, pID);
        
        END IF;

	END //
DELIMITER ;    

CALL stp_upsertMainEntity('QUES', 'QUES-1', @ques_id);

SELECT @ques_id;

CALL stp_upsertMainRecord(1, 'CODE', @code_id);
CALL stp_upsertMainRecord(1, 'LANG', @lang_id);
CALL stp_upsertMainRecord(1, 'PROP', @prop_id);
CALL stp_upsertMainRecord(1, 'ENTI', @enti_id);
CALL stp_upsertMainRecord(1, 'RELA', @rela_id);

CALL stp_upsertMainRecord(@lang_id, 'EN', @lang_en_id);
CALL stp_upsertMainRecord(@lang_id, 'NL', @lang_nl_id);

CALL stp_upsertMainRecord(@enti_id, 'QUES', @ques_id);


SELECT * FROM `main_record`;
SELECT * FROM `main_record_value`;

SELECT UPPER(LEFT(UUID(), 8)), UPPER(LEFT(UUID(), 8));

