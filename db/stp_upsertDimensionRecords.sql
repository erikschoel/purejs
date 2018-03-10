DROP PROCEDURE IF EXISTS stp_upsertDimensionRecords;

DELIMITER //
CREATE PROCEDURE stp_upsertDimensionRecords
	(IN
		pDimension VARCHAR(150)
	)
	BEGIN

		DECLARE id INT UNSIGNED DEFAULT 0;
		DECLARE cnt INT UNSIGNED DEFAULT 0;
		DECLARE dimension INT UNSIGNED DEFAULT 0;
		DECLARE dbid INT UNSIGNED DEFAULT 0;
        DECLARE recid INT UNSIGNED DEFAULT 0;

		SELECT COUNT(*) INTO cnt FROM tmp_records;

		WHILE id < cnt DO

			SET id = id + 1;
			SET dbid = 0;

			IF pDimension != '' AND dimension = 0 THEN
				SELECT madi_id INTO dimension FROM main_dimension WHERE madi_code = pDimension;
			ELSEIF pDimension = '' THEN
				SELECT madi_id INTO dimension FROM main_dimension WHERE madi_code = (SELECT tmp_dimension FROM tmp_records WHERE tmp_id = id);
			END IF;

			SELECT madr_id INTO dbid
			FROM tmp_records AS tmp
            JOIN main_record_value AS mava
			  ON mava.mava_value = tmp.tmp_code
			 AND mava.mava_fk_dimension = 2
			JOIN main_dimension_record AS madr
              ON madr.madr_fk_dimension = dimension
			 AND madr.madr_fk_record = mava.mava_fk_record
			WHERE tmp_id = id;

			IF dbid > 0 THEN

				UPDATE main_record AS mare
					JOIN main_dimension_record AS madr
					  ON madr.madr_fk_record = mare_id
                SET mare_modified_on = CURRENT_TIMESTAMP()
				WHERE madr.madr_id = dbid;

			ELSE

				CALL stp_upsertMainRecord(1, (SELECT UPPER(tmp_code) FROM tmp_records WHERE tmp_id = id), recid);
				INSERT INTO `main_dimension_record` VALUES (0, dimension, recid, 0);
				SET dbid = LAST_INSERT_ID();
			
			END IF;

			UPDATE tmp_records SET tmp_dbid = dbid WHERE tmp_id = id;

		END WHILE;

	END //
DELIMITER ;
