
DROP FUNCTION IF EXISTS `func_getUUID`;
DELIMITER //
CREATE FUNCTION `func_getUUID`()
RETURNS CHAR(8)
NOT DETERMINISTIC
BEGIN
	RETURN UPPER(LEFT(UUID(), 8));
END//
DELIMITER ;

DROP FUNCTION IF EXISTS `func_isNumeric`;
DELIMITER //
CREATE FUNCTION `func_isNumeric`(pValue varchar(255))
RETURNS BOOLEAN
NOT DETERMINISTIC
BEGIN
	RETURN pValue REGEXP '^[0-9]+$';
END//
DELIMITER ;

DROP FUNCTION IF EXISTS `func_getDimensionID`;
DELIMITER //
CREATE FUNCTION `func_getDimensionID`(pCode varchar(255))
RETURNS INT UNSIGNED
DETERMINISTIC
BEGIN
	RETURN CASE
		WHEN func_isNumeric(pCode) THEN CAST(pCode AS UNSIGNED)
		WHEN SUBSTRING(pCode, 1, 5) = 'madi_' THEN CAST(SUBSTRING(pCode, LOCATE('_', pCode) + 1) AS UNSIGNED)
        ELSE COALESCE(
		   (SELECT madi_id FROM main_dimension WHERE madi_code = pCode),
           (SELECT madi_id FROM main_dimension WHERE madi_code = 'sys.attr.code')
		) END;
END//
DELIMITER ;

DROP FUNCTION IF EXISTS `func_getRelationID`;
DELIMITER //
CREATE FUNCTION `func_getRelationID` (
	pParent VARCHAR(255),
	pChild VARCHAR(255))
RETURNS INT UNSIGNED
DETERMINISTIC
BEGIN
	RETURN (SELECT marl_id
		FROM main_relation
        WHERE marl_fk_parent_dimension = func_getDimensionID(pParent)
          AND marl_fk_child_dimension = func_getDimensionID(pChild));
END//
DELIMITER ;

DROP FUNCTION IF EXISTS `func_getParentPath`;
DELIMITER //
CREATE FUNCTION `func_getParentPath` (
	pParent VARCHAR(255),
	pChild VARCHAR(255),
    pFull BOOLEAN)
RETURNS CHAR(255)
DETERMINISTIC
BEGIN

	DECLARE pos INT UNSIGNED DEFAULT 0;
	DECLARE dot INT UNSIGNED DEFAULT 0;
	DECLARE len INT UNSIGNED DEFAULT 0;

	SET len = LEAST(CHAR_LENGTH(pParent), CHAR_LENGTH(pParent));
	matcher: WHILE pos < len DO
		SET pos = pos + 1;
		IF SUBSTRING(pParent, pos, 1) != SUBSTRING(pChild, pos, 1) THEN
			LEAVE matcher;
		ELSEIF SUBSTRING(pParent, pos, 1) = '.' THEN
			SET dot = pos;
		END IF;
	END WHILE;

	IF pos < len THEN
		RETURN CONCAT(CASE WHEN pFull THEN CONCAT(pParent, '.') ELSE '' END, SUBSTRING(pChild, dot + 1));
	ELSE
		RETURN SUBSTRING_INDEX(pChild, '.', -1);
	END IF;
END//
DELIMITER ;

DROP FUNCTION IF EXISTS `func_getComposedDimension`;
DELIMITER //
CREATE FUNCTION `func_getComposedDimension` (
	pParentID INT UNSIGNED,
	pChildID INT UNSIGNED)
RETURNS INT UNSIGNED
DETERMINISTIC
BEGIN

	DECLARE DimensionID INT UNSIGNED DEFAULT 0;
    
    RETURN COALESCE((SELECT madi_id
		FROM main_dimension
			WHERE madi_code = func_getParentPath(
		(SELECT madi_code FROM main_dimension WHERE madi_id = pParentID),
        (SELECT madi_code FROM main_dimension WHERE madi_id = pChildID),
        TRUE
	)), pParentID);
END//
DELIMITER ;

DROP FUNCTION IF EXISTS `func_getRecordID`;
DELIMITER //
CREATE FUNCTION `func_getRecordID` (
	pDimension VARCHAR(255),
	pAttribute VARCHAR(255),
    pValue VARCHAR(255))
RETURNS INT UNSIGNED
DETERMINISTIC
BEGIN
	
	RETURN (
    SELECT madr_id
		FROM main_record_value AS mava
		JOIN main_dimension_record AS madr
		  ON madr.madr_fk_record = mava.mava_fk_record
		 AND madr.madr_fk_dimension = func_getDimensionID(pDimension)
		WHERE mava.mava_value = pValue
		  AND mava.mava_fk_dimension = func_getDimensionID(pAttribute)
		  AND mava.mava_fk_language = 1);
END//
DELIMITER ;

DROP FUNCTION IF EXISTS `func_getRecordAttr`;
DELIMITER //
CREATE FUNCTION `func_getRecordAttr` (
	pRecordID INT UNSIGNED,
	pAttribute VARCHAR(255),
    pLanguage VARCHAR(255))
RETURNS VARCHAR(255)
DETERMINISTIC
BEGIN
	
	RETURN (
    SELECT mava_value
		FROM main_dimension_record AS madr
		JOIN main_record_value AS mava
		  ON madr.madr_fk_record = mava.mava_fk_record
		WHERE madr.madr_id = pRecordID
		  AND mava.mava_fk_dimension = func_getDimensionID(pAttribute)
		  AND mava.mava_fk_language = func_getDimensionID(pLanguage));
END//
DELIMITER ;

DROP FUNCTION IF EXISTS `func_getMadrID`;
DELIMITER //
CREATE FUNCTION `func_getMadrID` (pCode VARCHAR(255))
RETURNS INT UNSIGNED
DETERMINISTIC
BEGIN
	RETURN CASE
		WHEN func_isNumeric(pCode) THEN pCode
		WHEN pCode LIKE 'madr%' THEN SUBSTRING(pCode, LOCATE('_', pCode) + 1)
        WHEN pCode LIKE 'marr%' THEN (SELECT marr_fk_child FROM main_relation_record WHERE marr_id = SUBSTRING(pCode, LOCATE('_', pCode) + 1))
        ELSE (
		SELECT madr_id
		FROM main_dimension_record
		JOIN main_dimension
		  ON madi_id = madr_fk_dimension
		WHERE madr_fk_record = SUBSTRING(pCode, LOCATE('_', pCode) + 1)
	) END;
END//
DELIMITER ;

DROP FUNCTION IF EXISTS `func_getMareID`;
DELIMITER //
CREATE FUNCTION `func_getMareID` (pCode VARCHAR(255))
RETURNS INT UNSIGNED
DETERMINISTIC
BEGIN
	RETURN CASE
		WHEN func_isNumeric(pCode) THEN pCode
		WHEN pCode LIKE 'mare%' THEN SUBSTRING(pCode, LOCATE('_', pCode) + 1)
        WHEN pCode LIKE 'madr%' THEN (
		SELECT madr_fk_record
		FROM main_dimension_record
		WHERE madr_id = SUBSTRING(pCode, LOCATE('_', pCode) + 1))
        ELSE 0
	END;
END//
DELIMITER ;

DROP FUNCTION IF EXISTS `func_getOptionValue`;
DELIMITER //
CREATE FUNCTION `func_getOptionValue`
(
	pOptionID INT,
	pValue VARCHAR(1000)
)
RETURNS CHAR(255)
NOT DETERMINISTIC
BEGIN
	IF pOptionID IS NOT NULL THEN
		RETURN pOptionID;-- (SELECT mava_value FROM main_record_value WHERE mava_id = pOptionID);
	ELSE
		RETURN pValue;
	END IF;
END//
DELIMITER ;

DROP FUNCTION IF EXISTS `func_runSelector`;
DELIMITER //
CREATE FUNCTION `func_runSelector`
(
	pValue VARCHAR(1000),
	pOperator VARCHAR(45),
	pSelector VARCHAR(1000),
	pType VARCHAR(45)
)
RETURNS BOOLEAN
NOT DETERMINISTIC
BEGIN
	IF pType = 'number' THEN
		RETURN CASE
			WHEN pOperator = '='  THEN IF(CAST(pSelector AS UNSIGNED) =  CAST(pValue AS UNSIGNED), TRUE, FALSE)
			WHEN pOperator = '<'  THEN IF(CAST(pSelector AS UNSIGNED) <  CAST(pValue AS UNSIGNED), TRUE, FALSE)
			WHEN pOperator = '<=' THEN IF(CAST(pSelector AS UNSIGNED) <= CAST(pValue AS UNSIGNED), TRUE, FALSE)
			WHEN pOperator = '>=' THEN IF(CAST(pSelector AS UNSIGNED) >= CAST(pValue AS UNSIGNED), TRUE, FALSE)
			WHEN pOperator = '>'  THEN IF(CAST(pSelector AS UNSIGNED) >  CAST(pValue AS UNSIGNED), TRUE, FALSE)
			ELSE FALSE
		END;
	ELSE
		RETURN CASE
			WHEN pOperator = '='  THEN IF(CAST(pSelector AS CHAR) =  CAST(pValue AS CHAR), TRUE, FALSE)
			WHEN pOperator = '<'  THEN IF(CAST(pSelector AS CHAR) <  CAST(pValue AS CHAR), TRUE, FALSE)
			WHEN pOperator = '<=' THEN IF(CAST(pSelector AS CHAR) <= CAST(pValue AS CHAR), TRUE, FALSE)
			WHEN pOperator = '>=' THEN IF(CAST(pSelector AS CHAR) >= CAST(pValue AS CHAR), TRUE, FALSE)
			WHEN pOperator = '>'  THEN IF(CAST(pSelector AS CHAR) >  CAST(pValue AS CHAR), TRUE, FALSE)
			ELSE FALSE
		END;
	END IF;
END//
DELIMITER ;

DROP FUNCTION IF EXISTS `func_cacheRecordData`;
DELIMITER //
CREATE FUNCTION `func_cacheRecordData`
(
	pRecordID INT UNSIGNED,
    pLanguageID INT UNSIGNED
)
RETURNS INT UNSIGNED
NOT DETERMINISTIC
BEGIN

	INSERT INTO sys_record_data
		(syrd_id, syrd_fk_record, syrd_fk_language, syrd_invariant, syrd_data)
	VALUES
		(0, tableID, pLanguageID, UNIX_TIMESTAMP(), func_getRecordData(tableID, pLanguageID))
	ON DUPLICATE KEY UPDATE syrd_invariant = VALUES(syrd_invariant), syrd_data = VALUES(syrd_data);
        
	RETURN (SELECT syrd_id FROM sys_record_data WHERE syrd_fk_record = pRecordID AND syrd_fk_language = pLanguageID);

END//
DELIMITER ;

DROP FUNCTION IF EXISTS `func_getRecordData`;
DELIMITER //
CREATE FUNCTION `func_getRecordData`
(
	pRecordID INT UNSIGNED,
	pLanguageID INT UNSIGNED
)
RETURNS VARCHAR(2000)
NOT DETERMINISTIC
BEGIN

	RETURN CASE
		WHEN NULLIF(pRecordID, 0) IS NULL THEN '{}'
        ELSE COALESCE(
        
		(SELECT syrd_data FROM main_record JOIN sys_record_data
			ON syrd_fk_record = mare_id AND syrd_fk_language = pLanguageID
				WHERE mare_id = pRecordID AND syrd_invariant >= UNIX_TIMESTAMP(COALESCE(mare_modified_on, mare_created_on))),
        
		(SELECT
			CONCAT('{ "id": ', CAST(pRecordID AS CHAR), ', "lnid": ', CAST(pLanguageID AS CHAR), ', ', GROUP_CONCAT(json SEPARATOR ', '), ' }') AS json
		FROM
		(
			SELECT
				CONCAT(
					'"', madi_group, '": { ',
					GROUP_CONCAT(CONCAT('"', madi_name, '": "', mava_value, '"') ORDER BY madi_name SEPARATOR ', '),
					' }') AS json
			FROM
			(
				SELECT
					madi_code,
					REPLACE(REPLACE(madi_code, CONCAT('.', SUBSTRING_INDEX(madi_code, '.', -1)), ''), 'sys.', '') as madi_group,
					SUBSTRING_INDEX(madi_code, '.', -1) as madi_name,
					GROUP_CONCAT(CASE WHEN mava_fk_value IS NOT NULL THEN CONCAT('mare_', mava_fk_value) ELSE mava.mava_value END) as mava_value
				FROM main_record_value AS mava
				JOIN main_dimension AS madi
				  ON madi.madi_id = mava.mava_fk_dimension
				WHERE mava.mava_fk_record = pRecordID
				  -- AND mava_fk_language = CASE WHEN madi_code = 'sys.attr.code' THEN 1 ELSE COALESCE(NULLIF(pLanguageID, 0), 1) END
				  -- AND madi_code != 'sys.attr.options'
				GROUP BY madi_code
			) AS tmp
			GROUP BY madi_group
		) AS tmp))
	END;
END//
DELIMITER ;

DROP PROCEDURE IF EXISTS stp_upsertMainRecord;
DELIMITER //
CREATE PROCEDURE stp_upsertMainRecord
	(IN
		pTypeID INT UNSIGNED,
		pCode VARCHAR(45),
		pCheck BOOLEAN,
		OUT pID INT UNSIGNED
	)
	BEGIN

		DECLARE dimid INT UNSIGNED DEFAULT 0;
        DECLARE langid INT UNSIGNED DEFAULT 0;
        
		SET dimid = COALESCE(func_getDimensionID('sys.attr.code'), 2);
		SET pCode = TRIM(pCode);

		IF pCheck THEN
			SELECT COALESCE(MAX(mare.mare_id), 0)
			INTO pID
				FROM main_record_value AS mava
				JOIN main_record AS mare
				  ON mare.mare_id = mava.mava_fk_record
				WHERE mava_fk_dimension = dimid
				 AND  mare_fk_type = pTypeID
				 AND (pCode = '' OR mava_value = pCode);

		ELSE
			SET pID = 0;

		END IF;

		IF pID != 0 THEN

			UPDATE main_record SET mare_modified_on = CURRENT_TIMESTAMP() WHERE mare_id = pID;

		ELSE
        
			BEGIN
        
				DECLARE EXIT HANDLER FOR SQLEXCEPTION, SQLWARNING
				BEGIN
					ROLLBACK;
				END;

				START TRANSACTION;

				INSERT INTO main_record VALUES (0, pTypeID, CURRENT_TIMESTAMP(), 'system', NULL, NULL);
				SET pID = LAST_INSERT_ID();

				INSERT INTO main_record_value
					(mava_id, mava_fk_record, mava_fk_dimension, mava_fk_language, mava_fk_value, mava_value)
				SELECT
					0 		AS mava_id,
					pID 	AS mava_fk_record,
					dimid   AS mava_fk_dimension,
					1		AS mava_fk_language,
					NULL	AS mava_fk_value,
					pCode	AS mava_value;

				COMMIT;
                
			END;

		END IF;

	END //
DELIMITER ;

DROP PROCEDURE IF EXISTS stp_upsertRecordValue;
DELIMITER //
CREATE PROCEDURE stp_upsertRecordValue
	(IN
		pRecordID INT UNSIGNED,
		pDimension VARCHAR(255),
        pLanguage VARCHAR(255),
        pValue VARCHAR(255),
        pIsLookup BOOLEAN,
        OUT pID INT UNSIGNED
	)
	BEGIN

		DECLARE dimid INT UNSIGNED DEFAULT 0;
        DECLARE langid INT UNSIGNED DEFAULT 0;
        DECLARE prntval INT UNSIGNED DEFAULT 0;
        DECLARE multiple BOOLEAN DEFAULT FALSE;
        DECLARE val VARCHAR(255) DEFAULT '';
        DECLARE fkoption INT UNSIGNED DEFAULT 0;
        DECLARE existing BOOLEAN DEFAULT FALSE;
        
		SET dimid = func_getDimensionID(pDimension);
        SET langid = CASE
			WHEN pLanguage = '' THEN 1
            WHEN dimid = func_getDimensionID('sys.attr.code') THEN 1
            ELSE COALESCE(func_getDimensionID(pLanguage), 1) END;

		IF pIsLookup THEN
			SET multiple = IF(COALESCE(
				(SELECT 1
					FROM main_record_value
						WHERE mava_fk_dimension = func_getDimensionID('sys.attr.type')
						  AND mava_value = 'multiple'
						  AND mava_fk_language = 1
						  AND mava_fk_record = pRecordID),
				(SELECT 1
					FROM main_relation_record
					  JOIN main_dimension_record ON madr_id = marr_fk_child
					  JOIN main_record_value ON mava_fk_record = madr_fk_record
						WHERE mava_fk_dimension = func_getDimensionID('sys.attr.type')
						  AND mava_value = 'multiple'
						  AND mava_fk_language = 1
						  AND marr_id = pRecordID)                      
			), TRUE, FALSE);
		END IF;

		IF multiple THEN

			DROP TEMPORARY TABLE IF EXISTS tmp_values;
			CREATE TEMPORARY TABLE tmp_values (tmp_id INT UNSIGNED NOT NULL);

			IF TRIM(pValue) > '' THEN
				SET pValue = CONCAT(TRIM(pValue), ',');

				WHILE LOCATE(',', pValue) > 0 DO

					SET val = TRIM(SUBSTRING(pValue, 1, LOCATE(',', pValue) - 1));
					SET pValue = TRIM(SUBSTRING(pValue, LOCATE(',', pValue) + 1, 1000));
					SET fkoption = CAST(SUBSTRING(val, 6) AS UNSIGNED);
					
					INSERT INTO tmp_values VALUES (fkoption);
					SET existing = IF(
						(SELECT mava_id
							FROM main_record_value
								WHERE mava_fk_record = pRecordID
								  AND mava_fk_dimension = dimid
								  AND mava_fk_value = fkoption), TRUE, FALSE);

					IF NOT existing THEN
                        INSERT INTO main_record_value
                        (mava_id, mava_fk_record, mava_fk_dimension, mava_fk_language, mava_fk_value, mava_value)
                        VALUES (0, pRecordID, dimid, 1, fkoption, NULL);
					END IF;

				END WHILE;
			END IF;

			DELETE mava
			FROM main_record_value AS mava
			WHERE mava_fk_record = pRecordID
			  AND mava_fk_dimension = dimid
			  AND NOT EXISTS
				(SELECT 1 FROM tmp_values WHERE tmp_id = mava.mava_fk_value);
			
		ELSE

			SET val = IF(pIsLookup, REPLACE(pValue, 'mare_', ''), pValue);
            SET fkoption = IF(pIsLookup, CAST(val AS UNSIGNED), NULL);

			SELECT mava_id INTO pID
				FROM main_record_value
					WHERE mava_fk_record = pRecordID
					  AND mava_fk_dimension = dimid
					  AND mava_fk_language IN (langid, 1)
				ORDER BY ABS(SIGN(1 - CAST(mava_fk_language AS SIGNED))) LIMIT 1;

			IF pID > 0 THEN
				
				UPDATE main_record_value
				SET mava_fk_value = IF(pIsLookup, fkoption, NULL),
					mava_value = IF(pIsLookup, NULL, val)
				WHERE mava_id = pID;
				
			ELSEIF NOT EXISTS (SELECT 1
								FROM main_relation_record
								JOIN main_dimension_record
								  ON madr_id = marr_fk_child
								JOIN main_record_value
								  ON mava_fk_record = madr_fk_record
								 AND mava_fk_dimension = dimid
								 AND mava_fk_language IN (1, langid)
								 AND (pValue = '' OR IF(pIsLookup, mava_fk_value, mava_value) = IF(pIsLookup, fkoption, val))
								WHERE marr_id = pRecordID)
					
				AND NOT EXISTS (SELECT 1
								FROM main_dimension
								JOIN main_record_value
								  ON mava_fk_record = madi_fk_parent
								 AND mava_fk_dimension = dimid
								 AND mava_fk_language IN (1, langid)
								 AND (pValue = '' OR IF(pIsLookup, mava_fk_value, mava_value) = IF(pIsLookup, fkoption, val))
								WHERE madi_id = pRecordID)
								
			THEN

				INSERT INTO main_record_value
					(mava_id, mava_fk_record, mava_fk_dimension, mava_fk_language, mava_fk_value, mava_value)
				SELECT
					0 			AS mava_id,
					mare_id 	AS mava_fk_record,
					dimid AS mava_fk_dimension,
					langid AS mava_fk_language,
					IF(pIsLookup, fkoption, NULL) AS mava_fk_value,
					IF(pIsLookup, NULL, val) AS mava_value
				FROM main_record AS mare
				WHERE mare_id = pRecordID;

				SET pID = LAST_INSERT_ID(); 
			END IF;
		END IF;
	END //
DELIMITER ;

DROP PROCEDURE IF EXISTS stp_upsertDimensionRecordValue;
DELIMITER //
CREATE PROCEDURE stp_upsertDimensionRecordValue
	(IN
		pDimensionRecordID INT UNSIGNED,
		pDimension VARCHAR(255),
        pLanguage VARCHAR(255),
        pValue VARCHAR(255),
        pIsLookup BOOLEAN,
        OUT pID INT UNSIGNED
	)
	BEGIN

		DECLARE RecordID INT UNSIGNED DEFAULT 0;

		-- ATTEMPT TO FIND EXISTING RECORDS VALID FOR THE GIVEN ATTRIBUTES

		-- 1. records with the attribute specifically assigned
        -- 2. records that carry attributes of either the parent or the child edge(s) of a relation
        -- 3. records that carry attributes of the immediate parent dimension

		-- THE FOLLOWING LOGIC APPLIES
        -- 1 & 2: sys.attr.code is a UUID for all except the highest dimension parent
        -- parents can instruct descendants to handle values read and/or write 
		-- meta instructions by parent reference can be added to the schema
        -- e.g. instruction: show values of the dimension parent yes/no

        -- look at dimension records
		SET RecordID = COALESCE((SELECT madr_fk_record
			FROM main_dimension_record AS madr -- link to the dimension
				JOIN main_dimension AS madi ON madi_id = madr_fk_dimension -- to gain access to fk_root and fk_parent dimension
				LEFT JOIN main_relation_record AS marr ON marr_id = madr_fk_record -- and check if we borrow attributes from parent or child relation
				LEFT JOIN main_relation AS marl ON marl_id = marr_fk_relation AND marl_share_child_attrs_yn = 1 -- but this is turned off by default
					WHERE madr_id = pDimensionRecordID -- for the given madr_id
						AND EXISTS (SELECT 1 FROM main_dimension_record -- check for 
							WHERE madr_fk_dimension IN (madi_fk_root, COALESCE(marl_id, madr.madr_fk_dimension))
								AND madr_fk_record = func_getDimensionID(pDimension))), 0);

		IF RecordID = 0 THEN

			SET RecordID = COALESCE((SELECT madr_child.madr_fk_record 
				FROM main_dimension_record AS madr_rel
					JOIN main_relation_record AS marr ON marr_id = madr_rel.madr_fk_record
                    JOIN main_relation AS marl ON marl_id = marr_fk_relation AND marl_share_child_attrs_yn = 1
                    JOIN main_dimension_record AS madr_child ON madr_child.madr_id = marr_fk_child
						WHERE madr_rel.madr_id = pDimensionRecordID
							AND EXISTS (SELECT 1 FROM main_dimension_record
								WHERE madr_fk_dimension = madr_child.madr_fk_dimension
									AND madr_fk_record = func_getDimensionID(pDimension))), 0);

        END IF;

		IF RecordID > 0 THEN
			CALL stp_upsertRecordValue(RecordID, pDimension, pLanguage, pValue, pIsLookup, pID);
		END IF;

	END //
DELIMITER ;

DROP PROCEDURE IF EXISTS stp_upsertDimension;
DELIMITER //
CREATE PROCEDURE stp_upsertDimension
	(IN
		pParent VARCHAR(255),
		pCode VARCHAR(45),
		OUT pID INT UNSIGNED
	)
	BEGIN

		DECLARE Parent INT UNSIGNED DEFAULT 0;
		DECLARE Path VARCHAR(255) DEFAULT '';

		SET pParent = TRIM(pParent);
		SET pCode = TRIM(pCode);

		SET Parent = COALESCE((SELECT madi_id FROM `main_dimension` WHERE madi_code = pParent), 0);
        SET Path = CASE WHEN Parent = 0 THEN pCode ELSE CONCAT((SELECT madi_code FROM `main_dimension` WHERE madi_id = Parent), '.', pCode) END;

		SELECT COALESCE(MAX(madi.madi_id), 0)
			INTO pID
				FROM `main_dimension` AS madi
				WHERE madi_fk_parent = Parent
				 AND madi_code = Path;

		IF pID != 0 THEN

			UPDATE main_record SET mare_modified_on = CURRENT_TIMESTAMP() WHERE mare_id = pID;

		ELSE

			CALL stp_upsertMainRecord(1, Path, 0, pID);
			INSERT INTO `main_dimension`
            SELECT *
            FROM
            (
				SELECT pID as madi_id, Path as madi_code, case when madi_fk_parent = 1 then madi_id else madi_fk_root end as madi_fk_root, madi_id as madi_fk_parent
				FROM `main_dimension`
				WHERE madi_id = Parent
			) AS tmp
            WHERE NOT EXISTS (SELECT 1 FROM `main_dimension` WHERE madi_fk_parent = tmp.madi_fk_parent and madi_code = tmp.madi_code);

		END IF;

	END //
DELIMITER ;

DROP PROCEDURE IF EXISTS stp_upsertDimensionRecord;
DELIMITER //
CREATE PROCEDURE stp_upsertDimensionRecord
	(IN
		pDimension VARCHAR(255),
		pCode VARCHAR(45),
		OUT pID INT UNSIGNED
	)
	BEGIN

		DECLARE dimension INT UNSIGNED DEFAULT 0;
		DECLARE dbid INT UNSIGNED DEFAULT 0;
        DECLARE recid INT UNSIGNED DEFAULT 0;

        IF pCode = '' THEN
        	SET pCode = func_getUUID();
        END IF;

		SET dimension = func_getDimensionID(pDimension);

		SELECT madr_id INTO dbid
		FROM main_record_value AS mava
		JOIN main_dimension_record AS madr
          ON madr.madr_fk_dimension = dimension
		 AND madr.madr_fk_record = mava.mava_fk_record
		WHERE mava.mava_value = pCode
		  AND mava.mava_fk_dimension = func_getDimensionID('sys.attr.code');

		IF dbid > 0 THEN

			UPDATE main_record AS mare
				JOIN main_dimension_record AS madr
				  ON madr.madr_fk_record = mare_id
            SET mare_modified_on = CURRENT_TIMESTAMP()
			WHERE madr.madr_id = dbid;

			SET pID = dbid;
		ELSE

			BEGIN
				DECLARE EXIT HANDLER FOR SQLEXCEPTION, SQLWARNING
				BEGIN
					ROLLBACK;
				END;

				START TRANSACTION;

				CALL stp_upsertMainRecord(1, pCode, 0, recid);
				INSERT INTO `main_dimension_record` VALUES (0, dimension, recid, 0);
				SET dbid = LAST_INSERT_ID();

				COMMIT;

				SET pID = dbid;
			END;
		
		END IF;

	END //
DELIMITER ;

DROP PROCEDURE IF EXISTS stp_upsertDimensionRecords;
DELIMITER //
CREATE PROCEDURE stp_upsertDimensionRecords
	(IN
		pDimension VARCHAR(255)
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
			 AND mava.mava_fk_dimension = func_getDimensionID('sys.attr.code')
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

				CALL stp_upsertMainRecord(1, (SELECT UPPER(tmp_code) FROM tmp_records WHERE tmp_id = id), 0, recid);
				INSERT INTO `main_dimension_record` VALUES (0, dimension, recid, 0);
				SET dbid = LAST_INSERT_ID();
			
			END IF;

			UPDATE tmp_records SET tmp_dbid = dbid WHERE tmp_id = id;

		END WHILE;

	END //
DELIMITER ;

DROP PROCEDURE IF EXISTS stp_deleteDimension;
DELIMITER //
CREATE PROCEDURE stp_deleteDimension
	(IN
		pDimension VARCHAR(255),
		pRecordsOnly BOOLEAN,
		pDryRun BOOLEAN
	)
	BEGIN

		DECLARE dimension INT UNSIGNED DEFAULT 0;
		DECLARE dbid INT UNSIGNED DEFAULT 0;
        DECLARE recid INT UNSIGNED DEFAULT 0;

		SET dimension = func_getDimensionID(pDimension);

		IF dimension > 0 THEN

			DROP TEMPORARY TABLE IF EXISTS tmp_delete;
            CREATE TEMPORARY TABLE tmp_delete AS
            
				SELECT
					madr_id AS tmp_id,
                    'madr' AS tmp_type
				FROM main_dimension_record AS madr
				WHERE madr_fk_dimension = dimension
                
                UNION
                
                SELECT
					marr_id AS tmp_id,
                    'mare' AS tmp_type
                FROM main_relation_record AS marr
                WHERE marr_fk_relation = dimension
            ;

			IF NOT pRecordsOnly THEN

				INSERT INTO tmp_delete
                SELECT
					madi_id AS tmp_id,
                    'mare' AS tmp_type
                FROM main_dimension AS madi
                WHERE madi_id = dimension;

            END IF;

			IF pDryRun THEN

				SELECT *,
					func_getRecordData(CASE WHEN tmp_type = 'madr' THEN func_getMareID(CONCAT('madr_', tmp_id)) ELSE tmp_id END, '')
				FROM tmp_delete;

			ELSE

				BEGIN
					DECLARE EXIT HANDLER FOR SQLEXCEPTION, SQLWARNING
					BEGIN
						ROLLBACK;
					END;

					START TRANSACTION;

					DELETE mava
					FROM main_record_value AS mava
					JOIN tmp_delete AS del
					  ON del.tmp_id = mava.mava_fk_record
					 AND del.tmp_type = 'mare';

					DELETE marr
					FROM main_relation_record AS marr
					JOIN tmp_delete AS del
					  ON del.tmp_id = marr.marr_fk_parent
					 AND del.tmp_type = 'madr';

					DELETE marr
					FROM main_relation_record AS marr
					JOIN tmp_delete AS del
					  ON del.tmp_id = marr.marr_fk_child
					 AND del.tmp_type = 'madr';

					DELETE marr
					FROM main_relation_record AS marr
					JOIN tmp_delete AS del
					  ON del.tmp_id = marr.marr_id
					 AND del.tmp_type = 'mare';

					DELETE marr
					FROM main_relation_record AS marr
					JOIN tmp_delete AS del
					  ON del.tmp_id = marr.marr_fk_relation
					 AND del.tmp_type = 'mare';

					DELETE madr
					FROM main_dimension_record AS madr
					JOIN tmp_delete AS del
					  ON del.tmp_id = madr.madr_id
					 AND del.tmp_type = 'madr';

					IF NOT pRecordsOnly THEN

						DELETE marl
						FROM main_relation AS marl
						JOIN tmp_delete AS del
						  ON del.tmp_id = marl.marl_id
						 AND del.tmp_type = 'mare';

						DELETE madi
						FROM main_dimension AS madi
						JOIN tmp_delete AS del
						  ON del.tmp_id = madi.madi_id
						 AND del.tmp_type = 'mare';

						DELETE syrd
                        FROM sys_record_data AS syrd
                        JOIN tmp_delete AS del
                          ON del.tmp_id = syrd.syrd_fk_record
						 AND del.tmp_type = 'mare';

						DELETE mare
						FROM main_record AS mare
						JOIN tmp_delete AS del
						  ON del.tmp_id = mare.mare_id
						 AND del.tmp_type = 'mare';

					END IF;

					COMMIT;
				END;

			END IF;
		
		END IF;

	END //
DELIMITER ;

DROP PROCEDURE IF EXISTS stp_upsertRelation;
DELIMITER //
CREATE PROCEDURE stp_upsertRelation
	(IN
		pParent VARCHAR(255),
		pChild VARCHAR(255),
		OUT pID INT UNSIGNED
	)
	BEGIN

		DROP TEMPORARY TABLE IF EXISTS tmp_relation;
        CREATE TEMPORARY TABLE tmp_relation AS
        SELECT
			COALESCE(marl_id, 0) as tmp_id,
            tmp.*
		FROM
        (
			SELECT func_getDimensionID(pParent) as tmp_parent, func_getDimensionID(pChild) as tmp_child
		) AS tmp
        LEFT JOIN main_relation AS marl
          ON marl.marl_fk_parent_dimension = tmp.tmp_parent
		 AND marl.marl_fk_child_dimension = tmp.tmp_child;

		SELECT tmp_id INTO pID FROM tmp_relation;

		IF pID != 0 THEN

			UPDATE main_record SET mare_modified_on = CURRENT_TIMESTAMP() WHERE mare_id = pID;

		ELSE

			BEGIN
				DECLARE EXIT HANDLER FOR SQLEXCEPTION, SQLWARNING
				BEGIN
					ROLLBACK;
				END;

				START TRANSACTION;

				CALL stp_upsertDimension(pParent, func_getParentPath(pParent, pChild, FALSE), pID);
				INSERT INTO main_relation
                (
					marl_id, marl_fk_parent_dimension, marl_fk_child_dimension,
                    marl_recursive_yn, marl_include_yn, marl_access_yn, marl_use_dim_yn,
                    marl_share_parent_attrs_yn, marl_share_child_attrs_yn
				)
                SELECT pID, tmp_parent, tmp_child, 0, 1, 1, 0, 0, 0 FROM tmp_relation;

				COMMIT;
			END;

		END IF;

	END //
DELIMITER ;

DROP PROCEDURE IF EXISTS stp_upsertRelationRecord;
DELIMITER //
CREATE PROCEDURE stp_upsertRelationRecord
	(IN
		pRelation INT UNSIGNED,
        pParent INT UNSIGNED,
        pChild INT UNSIGNED,
        pOrder INT UNSIGNED,
        OUT pID INT UNSIGNED
	)
	BEGIN

		DECLARE dbid INT UNSIGNED DEFAULT 0;
        DECLARE recid INT UNSIGNED DEFAULT 0;

		SELECT marr.marr_id INTO dbid
        FROM main_dimension_record AS madr_c
		LEFT JOIN main_relation_record AS marr_c
           ON marr_c.marr_id = madr_c.madr_fk_record
		JOIN main_relation_record AS marr
           ON marr.marr_fk_relation = pRelation
		  AND marr.marr_fk_parent = pParent
		  AND marr.marr_fk_child = COALESCE(marr_c.marr_fk_child, madr_c.madr_id)
		WHERE madr_c.madr_id = pChild;

		IF dbid > 0 THEN

			UPDATE main_record SET mare_modified_on = CURRENT_TIMESTAMP() WHERE mare_id = dbid;

		ELSE

			BEGIN
				DECLARE EXIT HANDLER FOR SQLEXCEPTION, SQLWARNING
				BEGIN
					ROLLBACK;
				END;

				START TRANSACTION;

				CALL stp_upsertMainRecord(func_getDimensionID('sys.rela'), func_getUUID(), 0, recid);
				INSERT INTO `main_relation_record` VALUES (
					recid, pRelation, pParent, pChild, pOrder, COALESCE(
				(SELECT MAX(marr_level)
					FROM `main_dimension_record`
						JOIN `main_relation_record` ON marr_id = madr_fk_record
                          WHERE madr_id = pParent AND marr_fk_relation = pRelation), 0) + 1);

				INSERT INTO `main_dimension_record` SELECT 0, madr_fk_dimension, marr_id, marr_order
					FROM `main_relation_record`
	                  JOIN `main_dimension_record` ON madr_id = marr_fk_child
						WHERE marr_id = recid;
				SET dbid = recid;
                
                COMMIT;
			END;
		
		END IF;

		SET pID = dbid;

	END //
DELIMITER ;

DROP PROCEDURE IF EXISTS stp_upsertRelationRecords;
DELIMITER //
CREATE PROCEDURE stp_upsertRelationRecords
	(IN
		pRelation INT
	)
	BEGIN

		DECLARE id INT UNSIGNED DEFAULT 0;
		DECLARE cnt INT UNSIGNED DEFAULT 0;
		DECLARE relation INT UNSIGNED DEFAULT 0;
		DECLARE tmpid INT UNSIGNED DEFAULT 0;
		DECLARE dbid INT UNSIGNED DEFAULT 0;
        DECLARE recid INT UNSIGNED DEFAULT 0;
        DECLARE parent INT UNSIGNED DEFAULT 0;
        DECLARE child INT UNSIGNED DEFAULT 0;
        DECLARE ordr INT UNSIGNED DEFAULT 0;
        DECLARE done TINYINT UNSIGNED DEFAULT 0;

		DECLARE crsr CURSOR FOR SELECT tmp_id, tmp_fk_parent, tmp_fk_child, tmp_order FROM tmp_relations;
		DECLARE CONTINUE HANDLER FOR SQLSTATE '02000' SET done = 1;

		OPEN crsr;
		REPEAT
			FETCH crsr INTO tmpid, parent, child, ordr;
			IF NOT done THEN

				IF pRelation > 0 AND relation = 0 THEN
					SET relation = pRelation;
				ELSEIF pRelation = 0 THEN
					SELECT tmp_relation INTO relation FROM tmp_relations WHERE tmp_id = tmpid;
				END IF;

				CALL stp_upsertRelationRecord(relation, parent, child, ordr, dbid);
                UPDATE tmp_relations SET tmp_dbid = dbid WHERE tmp_id = tmpid;

			END IF;
		UNTIL done END REPEAT;
		CLOSE crsr;

	END //
DELIMITER ;

DROP PROCEDURE IF EXISTS stp_removeDimensionRecord;
DELIMITER //
CREATE PROCEDURE stp_removeDimensionRecord
	(IN
		pID INT UNSIGNED
	)
	BEGIN

		DROP TEMPORARY TABLE IF EXISTS tmp_madr;
        CREATE TEMPORARY TABLE tmp_madr AS
        SELECT madr_id AS tmp_id, madr_fk_record AS tmp_rec_id
		FROM main_dimension_record AS madr
		WHERE madr_id = pID;

		BEGIN
			DECLARE EXIT HANDLER FOR SQLEXCEPTION, SQLWARNING
			BEGIN
				ROLLBACK;
			END;

			START TRANSACTION;

			DELETE marr
	        FROM main_relation_record AS marr
	        WHERE marr_fk_parent = pID OR marr_fk_child = pID;

			DELETE sele
	        FROM main_selector AS sele
	        WHERE sele_fk_record = pID;

			DELETE madr
	        FROM main_dimension_record AS madr
			WHERE madr_id = pID;
	        
	        DELETE mava
	        FROM tmp_madr AS tmp
	        JOIN main_record_value AS mava
	          ON mava_fk_record = tmp.tmp_rec_id;

			DELETE marr
	        FROM tmp_madr AS tmp
	        JOIN main_relation_record AS marr
	          ON marr_id = tmp.tmp_rec_id;

			DELETE syrd
            FROM tmp_madr AS tmp
            JOIN sys_record_data AS syrd
              ON syrd.syrd_fk_record = tmp.tmp_rec_id;

	        DELETE mare
	        FROM tmp_madr AS tmp
	        JOIN main_record AS mare
	          ON mare_id = tmp.tmp_rec_id;

	        COMMIT;
	    END;

	END //
DELIMITER ;

DROP PROCEDURE IF EXISTS stp_removeRelationRecord;
DELIMITER //
CREATE PROCEDURE stp_removeRelationRecord
	(IN
		pRelRecID INT UNSIGNED
	)
	BEGIN

		DROP TEMPORARY TABLE IF EXISTS tmp_relations;
        CREATE TEMPORARY TABLE tmp_relations AS
        SELECT marr_id AS tmp_id, marr_fk_child
		FROM main_relation_record AS marr
		WHERE marr_id = pRelRecID;

		BEGIN
			DECLARE EXIT HANDLER FOR SQLEXCEPTION, SQLWARNING
			BEGIN
				ROLLBACK;
			END;

			START TRANSACTION;

			DELETE madr
	        FROM tmp_relations AS tmp
	        JOIN main_relation_record AS marr
	          ON marr_id = tmp.tmp_id
	        JOIN main_dimension_record AS madr
			  ON madr_fk_record = marr_id;

			DELETE marr
	        FROM tmp_relations AS tmp
	        JOIN main_relation_record AS marr
	          ON marr.marr_id = tmp.tmp_id;
              
			COMMIT;
	    END;

	END //
DELIMITER ;

DROP PROCEDURE IF EXISTS stp_removeRelationRecords;
DELIMITER //
CREATE PROCEDURE stp_removeRelationRecords
	(IN
		pRelation INT UNSIGNED,
        pParent INT UNSIGNED,
        pChild INT UNSIGNED
	)
	BEGIN

		DROP TEMPORARY TABLE IF EXISTS tmp_relations;
        CREATE TEMPORARY TABLE tmp_relations AS
        SELECT marr_id AS tmp_id, marr_fk_child
		FROM main_relation_record AS marr
		WHERE marr_fk_relation = pRelation
          AND marr_fk_parent = pParent
          AND marr_fk_child = pChild;
          -- AND FIND_IN_SET(marr_fk_child, pKeep) = 0;
          
		DELETE marr
        FROM tmp_relations AS tmp
        JOIN main_relation_record AS marr
          ON marr.marr_id = tmp.tmp_id;

	END //
DELIMITER ;

DROP PROCEDURE IF EXISTS stp_selectDimension;
DELIMITER //
CREATE PROCEDURE stp_selectDimension
	(IN
		pDimension VARCHAR(255),
        pLanguage VARCHAR(255)
	)
	BEGIN

		DECLARE dimid INT UNSIGNED DEFAULT 0;
        DECLARE langid INT UNSIGNED DEFAULT 0;

		SET dimid = func_getDimensionID(pDimension);
        SET langid = CASE WHEN pLanguage = '' THEN 1 ELSE COALESCE(func_getDimensionID(pLanguage), 1) END;    

        SELECT
			madi_id as tmp_id,
            0 as tmp_madr_id,
            0 as tmp_level,
			CONCAT('madi_', CAST(madi_id AS CHAR)) AS tmp_dbid,
            madi_code AS dimension,
            CASE WHEN madi_fk_root = func_getDimensionID('sys.attr') THEN CONCAT('madi_', CAST(madi_id AS CHAR)) ELSE 'madi' END AS tmp_madi,
            -- 'madi' AS tmp_madi,
		    func_getRecordData(madi_id, func_getDimensionID(pLanguage)) AS json,
            func_getRecordData(madi_fk_parent, func_getDimensionID(pLanguage)) as info
		FROM main_dimension
		WHERE madi_id = dimid;

	END //
DELIMITER ;

DROP PROCEDURE IF EXISTS stp_selectDimensionRecord;
DELIMITER //
CREATE PROCEDURE stp_selectDimensionRecord
	(IN
		pRecordID INT UNSIGNED,
        pLanguage VARCHAR(255)
	)
	BEGIN
    
		DECLARE code_id INT UNSIGNED DEFAULT 0;
		DECLARE desc_id INT UNSIGNED DEFAULT 0;
        DECLARE lang_id INT UNSIGNED DEFAULT 0;

		SET code_id = func_getDimensionID('sys.attr.code');
		SET desc_id = func_getDimensionID('sys.attr.desc');
		SET lang_id = func_getDimensionID(pLanguage);

		DROP TEMPORARY TABLE IF EXISTS tmp_record;
		CREATE TEMPORARY TABLE tmp_record AS
		SELECT
			madr_id,
            madr_fk_record,
			max(case when mava.mava_fk_dimension = code_id then mava.mava_value else '' end) as madr_code,
			max(case when mava.mava_fk_dimension = desc_id then mava.mava_value else '' end) as madr_desc
		FROM main_dimension_record AS madr
		JOIN main_record_value AS mava
		  ON mava.mava_fk_record = madr.madr_fk_record
		 AND mava.mava_fk_language = CASE WHEN mava.mava_fk_dimension = code_id THEN 1 ELSE lang_id END
		WHERE madr_id = pRecordID
		GROUP BY madr_id;

	END //
DELIMITER ;

DROP PROCEDURE IF EXISTS stp_selectDimensionRecords;
DELIMITER //
CREATE PROCEDURE stp_selectDimensionRecords
	(IN
		pDimension VARCHAR(255),
        pLanguage VARCHAR(255)
	)
	BEGIN
    
		DECLARE code_id INT UNSIGNED DEFAULT 0;
		DECLARE desc_id INT UNSIGNED DEFAULT 0;
        DECLARE lang_id INT UNSIGNED DEFAULT 0;

		SET code_id = func_getDimensionID('sys.attr.code');
		SET desc_id = func_getDimensionID('sys.attr.desc');
		SET lang_id = func_getDimensionID(pLanguage);

		DROP TEMPORARY TABLE IF EXISTS tmp_records;
		CREATE TEMPORARY TABLE tmp_records AS
		SELECT
			madr_id,
            madr_fk_record,
            madr_fk_dimension,
			max(case when mava.mava_fk_dimension = code_id then mava.mava_value else '' end) as madr_code,
			max(case when mava.mava_fk_dimension = desc_id then mava.mava_value else '' end) as madr_desc
		FROM main_dimension_record AS madr
        LEFT JOIN main_dimension AS madi
          ON madi.madi_id = madr.madr_fk_record
		JOIN main_record_value AS mava
		  ON mava.mava_fk_record = madr.madr_fk_record
		 AND mava.mava_fk_language = CASE WHEN mava.mava_fk_dimension = code_id THEN 1 ELSE lang_id END
		-- WHERE madr.madr_fk_dimension = (SELECT marl_fk_child_dimension FROM main_relation WHERE marl_id = func_getDimensionID(pDimension))
        WHERE ((locate('%', pDimension) > 0 AND madr.madr_fk_dimension IN
			(SELECT madi_id FROM main_dimension WHERE madi_code LIKE pDimension)) OR
            -- madr.madr_fk_dimension = (SELECT marl_fk_child_dimension FROM main_relation WHERE marl_id = func_getDimensionID(pDimension)))
            madr.madr_fk_dimension = func_getDimensionID(pDimension))
          AND madi.madi_id IS NULL
		AND NOT EXISTS
			(SELECT 1 FROM main_relation_record WHERE marr_id = madr.madr_fk_record)
		GROUP BY madr_id;

	END //
DELIMITER ;

DROP PROCEDURE IF EXISTS stp_selectDimensions;
DELIMITER //
CREATE PROCEDURE stp_selectDimensions
	(IN
		pRootDim VARCHAR(255),
        pFilter TINYINT
	)
	BEGIN

		SELECT CONCAT('mare_', cast(madi_id AS CHAR)) AS `name`, 'attrs' as madi, t.*
            FROM main_dimension AS t
            LEFT JOIN main_relation AS r
                ON r.marl_id = t.madi_id
            WHERE (pRootDim IN ('', 'sys') OR t.madi_fk_parent = func_getDimensionID(pRootDim))
            AND CASE
				WHEN pFilter = 0 THEN COALESCE(r.marl_id, 1)
                WHEN pFilter = 1 THEN r.marl_id IS NULL
                ELSE r.marl_id IS NOT NULL
			END
			ORDER BY madi_code;
	END //
DELIMITER ;

DROP PROCEDURE IF EXISTS stp_selectRelationRecords;
DELIMITER //
CREATE PROCEDURE stp_selectRelationRecords
	(IN
		pRelation INT,
        pParentID INT,
        pChildID INT,
        pLanguage VARCHAR(255)
	)
	BEGIN
    
		DECLARE code_id INT UNSIGNED DEFAULT 0;
		DECLARE desc_id INT UNSIGNED DEFAULT 0;
        DECLARE lang_id INT UNSIGNED DEFAULT 0;

		SET code_id = func_getDimensionID('sys.attr.code');
		SET desc_id = func_getDimensionID('sys.attr.desc');
        SET lang_id = func_getDimensionID(pLanguage);

		DROP TEMPORARY TABLE IF EXISTS tmp_relations;
		CREATE TEMPORARY TABLE tmp_relations AS
		SELECT
			rela_id,
			rela_parent_id,
			rela_parent_record,
			max(case when mavap.mava_fk_dimension = code_id then mavap.mava_value else '' end) as rela_parent_code,
			max(case when mavap.mava_fk_dimension = desc_id then mavap.mava_value else '' end) as rela_parent_desc,
			rela_child_id,
			rela_child_record,
			max(case when mavac.mava_fk_dimension = code_id then mavac.mava_value else '' end) as rela_child_code,
			max(case when mavac.mava_fk_dimension = desc_id then mavac.mava_value else '' end) as rela_child_desc,
            rela_order
		FROM
		(
			SELECT
				marr.marr_id as rela_id,
				madrp.madr_id as rela_parent_id,
				madrp.madr_fk_record as rela_parent_record,
				madrc.madr_id as rela_child_id,
				madrc.madr_fk_record as rela_child_record,
                marr.marr_order as rela_order
			FROM main_relation_record AS marr
			JOIN main_dimension_record AS madrp
			  ON madrp.madr_id = marr.marr_fk_parent
			JOIN main_dimension_record AS madrc
			  ON madrc.madr_id = marr.marr_fk_child
			WHERE marr.marr_fk_relation = pRelation
              AND (pParentID = marr.marr_fk_parent OR pParentID = 0)
              AND (pChildID = marr.marr_fk_child OR pChildID = 0)
		) AS tmp
		JOIN main_record_value AS mavap
		  ON mavap.mava_fk_record = rela_parent_record
		 AND mavap.mava_fk_language = CASE WHEN mavap.mava_fk_dimension = code_id THEN 1 ELSE lang_id END
		JOIN main_record_value AS mavac
		  ON mavac.mava_fk_record = rela_child_record
		 AND mavac.mava_fk_dimension = mavap.mava_fk_dimension
		 AND mavac.mava_fk_language = mavap.mava_fk_language
		GROUP BY rela_id;

	END //
DELIMITER ;

DROP PROCEDURE IF EXISTS stp_selectRecords;
DELIMITER //
CREATE PROCEDURE stp_selectRecords
	(IN
		pDimension VARCHAR(255),
        pLanguage VARCHAR(255)
	)
	BEGIN
    
		IF pLanguage = '' THEN
			SET pLanguage = 'sys.lang.nl';
		END IF;

		DROP TEMPORARY TABLE IF EXISTS tmp_records;
		CREATE TEMPORARY TABLE tmp_records AS
		SELECT
			dim_id,
			dim_code,
			COALESCE(rec_id, 0) AS rec_id,
            main_rec_id,
			COALESCE(rec_code, dim_code) AS rec_code,
			COALESCE(rec_desc, rec_code, dim_code) AS rec_desc,
			rec_type,
			marl_id AS rela_id,
			COALESCE(marr_order, 0) AS rela_order,
			COALESCE(marr_child_code, '') AS rela_child_code,
			COALESCE(marr_child_desc, '') AS rela_child_desc
		FROM
		(
			SELECT
				tmp.dim_id,
				tmp.dim_code,
				COALESCE(tmp.rec_id, marr.marr_fk_parent) AS rec_id,
                main_rec_id,
				COALESCE(func_getRecordAttr(tmp.rec_id, 'sys.attr.code', 'sys'), func_getRecordAttr(marr.marr_fk_parent, 'sys.attr.code', 'sys')) AS rec_code,
				COALESCE(func_getRecordAttr(tmp.rec_id, 'sys.attr.desc', pLanguage), func_getRecordAttr(marr.marr_fk_parent, 'sys.attr.desc', pLanguage)) AS rec_desc,
				CASE WHEN marl_id IS NOT NULL THEN 'relation' ELSE 'dimension' END AS rec_type,
				COALESCE(marl_id, 0) AS marl_id,
				marr_order,
				func_getRecordAttr(marr.marr_fk_child, 'sys.attr.code', 'sys') AS marr_child_code,
				func_getRecordAttr(marr.marr_fk_child, 'sys.attr.desc', pLanguage) AS marr_child_desc
			FROM
			(
				SELECT
					madi_id			AS dim_id,
					madi_code		AS dim_code,
					madr_id			AS rec_id,
                    madr_fk_record	AS main_rec_id
				FROM main_dimension
				LEFT JOIN main_dimension_record
				  ON madr_fk_dimension = madi_id
				 AND NOT EXISTS (SELECT 1 FROM main_dimension WHERE madi_id = madr_fk_record)
				WHERE madi_code LIKE pDimension
			) AS tmp
			LEFT JOIN main_relation AS marl
			  ON marl.marl_id = tmp.dim_id
			LEFT JOIN main_relation_record AS marr
			  ON marr.marr_fk_relation = marl.marl_id
			ORDER BY dim_code, rec_id, marr_order, marr_child_code
		) AS tmp;
	END //
DELIMITER ;


DROP PROCEDURE IF EXISTS stp_selectRecursive;
DELIMITER //
CREATE PROCEDURE stp_selectRecursive
	(IN
		pRecordID VARCHAR(255),
		pLanguage VARCHAR(255),
        pOrderDim BOOLEAN
	)
	BEGIN

		CALL stp_selectRecursiveLevels(pRecordID, pLanguage, pOrderDim, -1, 0);

	END //
DELIMITER ;

DROP PROCEDURE IF EXISTS stp_selectMeta;
DELIMITER //
CREATE PROCEDURE stp_selectMeta
	(IN
		pDimension VARCHAR(255),
		pLanguage VARCHAR(255)
	)
	BEGIN
    
		DECLARE DimID INT UNSIGNED DEFAULT 0;
        DECLARE LangID INT UNSIGNED DEFAULT 0;
        SET DimID = CASE
			WHEN pDimension = '' THEN 0
			WHEN func_isNumeric(pDimension) THEN CAST(pDimension AS UNSIGNED)
            ELSE func_getDimensionID(pDimension) -- (SELECT madi_id FROM main_dimension WHERE madi_code = pDimension)
		END;
        SET LangID = func_getDimensionID(pLanguage);

		SET SESSION group_concat_max_len = 1000000;

		SELECT
			madi.madi_id,
            madi.madi_code,
            CASE WHEN marl.marl_id IS NOT NULL THEN CONCAT('madi_', CAST(marl.marl_fk_child_dimension AS CHAR)) ELSE '' END AS madi_child_dim,
            -- SIGN(COALESCE(marl.marl_id, 0)) - SIGN(COALESCE(marl_parent.marl_id, 0)) as madi_is_relation,
            CASE WHEN marl.marl_id IS NOT NULL AND marl.marl_fk_parent_dimension = marl.marl_fk_child_dimension THEN 1 ELSE 0 END AS madi_is_relation,
			func_getRecordData(madi.madi_id, LangID) as madi_meta,
			func_getRecordData(madi.madi_fk_parent, LangID) as madi_parent_meta,
			CONCAT('[ ', GROUP_CONCAT(DISTINCT func_getRecordData(is_madi.madi_id, LangID) ORDER BY madr_order, is_madi.madi_code SEPARATOR ', '), ' ]') as madi_fields,
			COALESCE((SELECT CONCAT('[ ', GROUP_CONCAT(CONCAT('{ "id": ', child_dim.madi_id, ', "marl": ', marl_id, ', "code": "', child_dim.madi_code, '", "ref": "', rel_dim.madi_code, '" }') SEPARATOR ', '), ' ]')
				FROM main_relation
				JOIN main_dimension AS child_dim ON child_dim.madi_id = marl_fk_child_dimension
				JOIN main_dimension AS rel_dim ON rel_dim.madi_id = marl_id
					WHERE (marl_fk_parent_dimension = madi.madi_id OR (marl_recursive_yn AND marl_id = madi.madi_id))), '[]') as madi_nodes,
			(SELECT COUNT(*) FROM main_dimension_record WHERE madr_fk_dimension = madi.madi_id) as madi_count,
			COALESCE((SELECT CONCAT('[ ', GROUP_CONCAT(func_getRecordData(madr_fk_record, LangID) SEPARATOR ', '), ' ]')
				FROM main_dimension_record AS m
                JOIN main_record AS r ON mare_id = madr_fk_record AND mare_fk_type = 1
					WHERE madr_fk_dimension = madi.madi_id
						AND NOT EXISTS (SELECT 1 FROM main_dimension WHERE madi_id = m.madr_fk_record)), '[]') as madi_values
		FROM main_dimension AS madi
        LEFT JOIN main_dimension_record AS madr
		  ON madr.madr_fk_dimension IN (madi.madi_fk_root, madi.madi_id)
		LEFT JOIN main_dimension AS is_madi
		  ON is_madi.madi_id = madr.madr_fk_record
		LEFT JOIN main_relation AS marl
          ON marl.marl_id = madi.madi_id
		LEFT JOIN main_relation AS marl_parent
          ON marl_parent.marl_id = madi.madi_fk_parent
		WHERE (madi.madi_id = DimID OR DimID = 0)
		GROUP BY madi.madi_id
		ORDER BY madi.madi_code;
	END //
DELIMITER ;

DROP PROCEDURE IF EXISTS stp_selectRootRecords;
DELIMITER //
CREATE PROCEDURE stp_selectRootRecords()
	BEGIN
		SELECT
			tmp.*,
			madi_code AS dimension,
			concat('madi_', tmp_dim_id) AS tmp_madi,
			concat('mare_', tmp_rec_id) AS tmp_name,
			func_getRecordData(tmp_rec_id, 'sys.lang.nl')
		FROM
		(
			SELECT madr_id AS tmp_madr_id, madr_fk_dimension AS tmp_dim_id, madr_fk_record AS tmp_rec_id
			FROM main_relation_record AS marr
			JOIN main_dimension_record AS madr ON madr_id = marr_fk_parent
			WHERE NOT EXISTS
				(SELECT 1 FROM main_relation_record
					WHERE marr_fk_child = madr.madr_id)
			AND NOT EXISTS (SELECT 1 FROM main_relation_record WHERE marr_id = madr.madr_fk_record)
			GROUP BY madr_id, madr_fk_dimension, madr_fk_record
		) AS tmp
		JOIN main_dimension ON madi_id = tmp_dim_id;
	END //
DELIMITER ;

DROP PROCEDURE IF EXISTS stp_selectEndpointData;
DELIMITER //
CREATE PROCEDURE stp_selectEndpointData()
	BEGIN

		SELECT tmp.*,
			CONCAT(
				'Route::GET(\'', tmp_path, '/{code?}\', \'DbController@getRecords',
				UCASE(LEFT(tmp_prefix, 1)), SUBSTRING(tmp_prefix, 2),
				UCASE(LEFT(tmp_name, 1)), SUBSTRING(tmp_name, 2), '\');') AS tmp_route
		FROM
		(
			SELECT
				SUBSTRING_INDEX(tmp_path, '/', -1) AS tmp_name,
		        CASE WHEN LOCATE('/', tmp_path, 2) > 0 THEN SUBSTRING_INDEX(tmp_path, '/', 1) ELSE '' END AS tmp_prefix,
		        tmp_path
			FROM
			(
				SELECT
					REPLACE(SUBSTRING_INDEX(REPLACE(madi_code, 'sys.', ''), '.', CASE WHEN madi_code LIKE 'sys.type%' THEN 2 ELSE 1 END), '.', '/') AS tmp_path
				FROM main_dimension
				WHERE madi_fk_root > 1
				GROUP BY tmp_path
			) AS tmp
			ORDER BY tmp_path
		) AS tmp;

	END //
DELIMITER ;

DROP PROCEDURE IF EXISTS stp_truncateTransactionLog;
DELIMITER //
CREATE PROCEDURE stp_truncateTransactionLog()
	BEGIN

		SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
		SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
		SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

		TRUNCATE TABLE sys_transaction_log;
		TRUNCATE TABLE sys_transaction;

		SET SQL_MODE=@OLD_SQL_MODE;
		SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
		SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
        
	END //
DELIMITER ;

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
						SELECT
							0, tableID, func_getDimensionID('sys.lang.nl'), UNIX_TIMESTAMP(), func_getRecordData(tableID, func_getDimensionID('sys.lang.nl'))
						FROM main_record
							WHERE mare_id = tableID
                    ON DUPLICATE KEY UPDATE syrd_invariant = VALUES(syrd_invariant), syrd_data = VALUES(syrd_data);
                
                END IF;

			END IF;
		UNTIL done END REPEAT;
		CLOSE crsr;

		COMMIT;

		-- DELETE FROM sys_transaction_log WHERE sytl_fk_transaction = pTranID;
        -- DELETE FROM sys_transaction WHERE sytr_id = pTranID;
		-- CALL stp_truncateTransactionLog();

	END //
DELIMITER ;


DROP TRIGGER IF EXISTS trig_i_main_record_value;
DELIMITER //
CREATE TRIGGER trig_i_main_record_value AFTER INSERT ON main_record_value
	FOR EACH ROW BEGIN
    
		INSERT IGNORE INTO sys_transaction_log
			SELECT 0, sytr_id, 'main_record', NEW.mava_fk_record
		FROM sys_transaction
			WHERE sytr_session_id = CONNECTION_ID();
    
	END //
DELIMITER ;

DROP TRIGGER IF EXISTS trig_u_main_record_value;
DELIMITER //
CREATE TRIGGER trig_u_main_record_value AFTER UPDATE ON main_record_value
	FOR EACH ROW BEGIN
		IF (COALESCE(NEW.mava_fk_value, NEW.mava_value) != COALESCE(OLD.mava_fk_value, OLD.mava_value)) THEN

			INSERT IGNORE INTO sys_transaction_log
				SELECT 0, sytr_id, 'main_record', NEW.mava_fk_record
			FROM sys_transaction
				WHERE sytr_session_id = CONNECTION_ID();

		END IF;
	END //
DELIMITER ;

DROP TRIGGER IF EXISTS trig_d_main_record_value;
DELIMITER //
CREATE TRIGGER trig_d_main_record_value AFTER DELETE ON main_record_value
	FOR EACH ROW BEGIN

		INSERT IGNORE INTO sys_transaction_log
			SELECT 0, sytr_id, 'main_record', OLD.mava_fk_record
		FROM sys_transaction
			WHERE sytr_session_id = CONNECTION_ID();

	END //
DELIMITER ;
/*
select *, replace(mava_value, 'quop', 'mare') from main_record_value where mava_value like 'quop%';
truncate table sys_record_data;
update main_record_value set mava_value = replace(mava_value, 'quop', 'mare') where mava_value like 'quop%';

select func_getRecordData(func_getDimensionID('madi_168'), 'sys.lang.nl');
select * from sys_transaction;
call stp_selectMeta('madi_36', 'sys.lang.nl');

call stp_selectDimension('madi_37', 'sys.lang.nl');

call stp_selectRecursive('madi_168', 'sys.lang.nl', true);
*/