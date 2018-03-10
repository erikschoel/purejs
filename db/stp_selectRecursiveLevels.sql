DROP PROCEDURE IF EXISTS stp_selectRecursiveLevels;
DELIMITER //
CREATE PROCEDURE stp_selectRecursiveLevels
	(IN
		pRecordID VARCHAR(255),
		pLanguage VARCHAR(255),
        pOrderDim BOOLEAN,
        pLevelsDown INT,
        pLevelsUp INT
	)
	BEGIN

		DECLARE rowcount INT UNSIGNED DEFAULT 0;
        DECLARE lvl INT UNSIGNED DEFAULT 0;

		DROP TEMPORARY TABLE IF EXISTS tmp_records;
		CREATE TEMPORARY TABLE tmp_records
		(
			tmp_id INT UNSIGNED AUTO_INCREMENT,
            tmp_madr_id INT UNSIGNED NOT NULL,
			primary key (tmp_id)
		);

		IF func_isNumeric(pRecordID) THEN
			INSERT INTO tmp_records VALUES (0, pRecordID);
		ELSEIF substring(pRecordID, 1, 4) = 'marr' THEN
			INSERT INTO tmp_records
            SELECT 0, madr_id
            FROM main_dimension_record AS madr
            WHERE madr_fk_record = SUBSTRING(pRecordID, LOCATE('_', pRecordID) + 1);
		ELSEIF substring(pRecordID, 1, 4) = 'madi' THEN
			INSERT INTO tmp_records
			SELECT 0, madr_id
			FROM main_dimension_record AS madr
			WHERE madr_fk_dimension = func_getDimensionID(pRecordID)
            AND NOT EXISTS
				(SELECT 1 FROM main_dimension WHERE madi_id = madr.madr_fk_record)
            AND NOT EXISTS
				(SELECT 1 FROM main_relation_record WHERE marr_id = madr.madr_fk_record)
                
			UNION
            
            SELECT 0, madr_id
            FROM main_relation_record AS marr
            JOIN main_dimension_record AS madr ON madr_fk_record = marr_id
            WHERE marr_fk_relation = func_getDimensionID(pRecordID)
            
            ORDER BY madr_id;

		END IF;

		DROP TEMPORARY TABLE IF EXISTS tmp_recursive;
        CREATE TEMPORARY TABLE tmp_recursive
        (
			tmp_id			INT UNSIGNED AUTO_INCREMENT,
			tmp_dim_id		INT UNSIGNED NULL,
            tmp_dim_rec		INT UNSIGNED NULL,
            tmp_madr_id		INT UNSIGNED NULL,
            tmp_marr_id		INT UNSIGNED NULL,
            tmp_parent_id	INT UNSIGNED NULL,
            tmp_rec_id		INT UNSIGNED NOT NULL,
            tmp_level		INT UNSIGNED NOT NULL,
            tmp_sort_order	VARCHAR(255),
            primary key (tmp_id)
		);

		DROP TEMPORARY TABLE IF EXISTS tmp_collect_records;
        CREATE TEMPORARY TABLE tmp_collect_records
        (
			tmp_id			INT UNSIGNED NOT NULL,
			tmp_dim_id		INT UNSIGNED NULL,
            tmp_dim_rec		INT UNSIGNED NULL,
            tmp_madr_id		INT UNSIGNED NULL,
            tmp_marr_id		INT UNSIGNED NULL,
            tmp_parent_id	INT UNSIGNED NULL,
            tmp_rec_id		INT UNSIGNED NOT NULL,
            tmp_order		INT UNSIGNED NOT NULL,
            tmp_level		INT UNSIGNED NOT NULL,
            tmp_sort_order	VARCHAR(255)
        );

		DROP TEMPORARY TABLE IF EXISTS tmp_add_records;
        CREATE TEMPORARY TABLE tmp_add_records LIKE tmp_collect_records;

        INSERT INTO tmp_recursive SELECT DISTINCT
			0, madr.madr_fk_dimension, coalesce(marr_fk_relation, madr.madr_fk_dimension),
            -- coalesce(marr_fk_relation, madr.madr_id),
            madr.madr_id,
--             coalesce((select marr_id
-- 				from main_relation_record
-- 					where marr_id = madr.madr_fk_record
-- 						-- and marr_fk_relation = madr.madr_fk_dimension
-- 					), 0) as tmp_marr_id,
			coalesce(marr_id, 0) as tmp_marr_id,
            0 as tmp_parent_id,
            madr.madr_id, 0, LPAD(CAST(tmp.tmp_id AS CHAR), 5, '0')
		FROM tmp_records AS tmp
		JOIN main_dimension_record AS madr ON madr.madr_id = tmp.tmp_madr_id
        JOIN main_dimension AS madi ON madi.madi_id = madr.madr_fk_dimension
        LEFT JOIN main_relation_record AS marr ON marr_id = madr.madr_fk_record
        ORDER BY tmp.tmp_id, madi.madi_code;
--         LEFT JOIN main_relation_record AS link ON link.marr_id = madr.madr_fk_record AND link.marr_fk_relation = madr.madr_fk_dimension
--         LEFT JOIN main_relation AS marl ON marl.marl_id = link.marr_fk_relation;
-- 		LEFT JOIN main_relation_record AS link ON link.marr_fk_child = madr.madr_id
--         LEFT JOIN main_dimension_record AS madrel ON madrel.madr_fk_record = link.marr_id AND madrel.madr_fk_dimension = link.marr_fk_relation
-- 		WHERE link.marr_id IS NULL OR madrel.madr_id IS NOT NULL;

        SET rowcount = ROW_COUNT();        
		WHILE rowcount > 0 AND (lvl < pLevelsDown OR pLevelsDown < 0) DO

			TRUNCATE TABLE tmp_collect_records;
            INSERT INTO tmp_collect_records
			SELECT
				tmp_id,
				marr.marr_fk_relation as tmp_dim_id,
				madl.madr_fk_dimension as tmp_dim_rec,
				madr.madr_id as tmp_madr_id,
				marr.marr_id as tmp_marr_id,
				tmp_madr_id as tmp_parent_id,
				-- marr.marr_fk_child as tmp_rec_id,
                madr.madr_id as tmp_rec_id,
				marr.marr_order as tmp_order,
                tmp_level + 1,
				tmp_sort_order
			FROM tmp_recursive
			JOIN main_relation_record AS marr_link
              ON marr_link.marr_id = tmp_marr_id
			JOIN main_relation_record AS marr
			  ON marr.marr_fk_parent = marr_link.marr_fk_child
			JOIN main_relation AS marl
              ON marl_id = marr.marr_fk_relation
			 AND (marl_include_yn = 1 OR lvl = 0)
             -- AND (marl_access_yn = 1 OR lvl <= 1)
			LEFT JOIN main_dimension_record AS madr
			  ON madr.madr_fk_record = marr.marr_id
			 -- AND madr.madr_fk_dimension = marr.marr_fk_relation
			LEFT JOIN main_dimension_record AS madl
			  ON madl.madr_id = marr.marr_fk_child
			WHERE tmp_level = lvl;

			INSERT INTO tmp_collect_records
			SELECT
				tmp_id,
				marr.marr_fk_relation as tmp_dim_id,
				madl.madr_fk_dimension as tmp_dim_rec,
				madr.madr_id as tmp_madr_id,
				marr.marr_id as tmp_marr_id,
				tmp_madr_id as tmp_parent_id,
				-- marr.marr_fk_child as tmp_rec_id,
                madr.madr_id as tmp_rec_id,
				marr.marr_order as tmp_order,
                tmp_level + 1,
				tmp_sort_order
			FROM tmp_recursive
			JOIN main_relation_record AS marr
			  ON marr.marr_fk_parent = tmp_madr_id
			JOIN main_relation AS marl
              ON marl_id = marr_fk_relation
			 AND (marl_include_yn = 1 OR lvl = 0)
			JOIN main_dimension_record AS madr
			  ON madr.madr_fk_record = marr.marr_id
			 -- AND madr.madr_fk_dimension = marr.marr_fk_relation
			JOIN main_dimension_record AS madl
			  ON madl.madr_id = marr.marr_fk_child
			WHERE tmp_level = lvl;

			IF pLevelsUp > 0 THEN

				INSERT INTO tmp_collect_records
				SELECT
					tmp_id,
					marr.marr_fk_relation as tmp_dim_id,
					madl.madr_fk_dimension as tmp_dim_rec,
					madl.madr_id as tmp_madr_id,
					madl.madr_fk_record as tmp_marr_id,
					madl.madr_id as tmp_parent_id,
					-- marr.marr_fk_child as tmp_rec_id,
					madl.madr_id as tmp_rec_id,
					marr.marr_order as tmp_order,
                    tmp_level,
					tmp_sort_order
				FROM tmp_recursive
				JOIN main_relation_record AS marr
				  ON marr.marr_fk_child = tmp_madr_id
				JOIN main_dimension_record AS madr
				  ON madr.madr_fk_record = marr.marr_id
				 -- AND madr.madr_fk_dimension = marr.marr_fk_relation
				JOIN main_dimension_record AS madl
				  ON madl.madr_id = marr.marr_fk_parent
				WHERE tmp_level = lvl;

            END IF;

			INSERT INTO tmp_collect_records
			SELECT DISTINCT
				tmp_id,
				func_getComposedDimension(tmp_dim_id, madr_fk_dimension) AS tmp_dim_id,
				madr_fk_dimension as tmp_dim_rec,
				madr_id as tmp_madr_id,
				sele_fk_dimension as tmp_marr_id,
				tmp_madr_id as tmp_parent_id,
				sere_fk_record AS tmp_rec_id,
				0 as tmp_order,
                tmp_level + 1,
				tmp_sort_order
			FROM tmp_recursive
			JOIN main_relation_record as marr
			  ON marr.marr_fk_parent = tmp_madr_id
			JOIN main_selector as sele
			  ON sele.sele_fk_record = marr.marr_fk_child
			JOIN main_selector_record AS sere
			  ON sere.sere_fk_selector = sele.sele_id
			JOIN main_record_value AS mava
			  ON mava.mava_fk_record = marr.marr_id
			 AND mava.mava_fk_dimension = sele.sele_fk_dimension
			 AND func_runSelector(
				 func_getOptionValue(mava.mava_fk_value, mava.mava_value),
				 sele.sele_operator,
				 func_getOptionValue(sele.sele_fk_value, sele.sele_value),
				 sele.sele_type
				) = 1
			JOIN main_dimension_record AS madr
			  ON madr_id = sere.sere_fk_record
			WHERE tmp_level = lvl;

			TRUNCATE TABLE tmp_add_records;
            INSERT INTO tmp_add_records
            SELECT tmp.*
            FROM tmp_collect_records AS tmp
            JOIN main_dimension
              ON madi_id = tmp_dim_id
			WHERE NOT EXISTS (SELECT 1 FROM tmp_recursive WHERE tmp_madr_id = tmp.tmp_madr_id)
            ORDER BY tmp_id, madi_code, tmp_order, tmp_marr_id;

			SET rowcount = ROW_COUNT();
			SET @id = 0;
            SET @dim = 0;

			IF pOrderDim AND rowcount > 0 THEN            
				UPDATE tmp_add_records
                SET tmp_sort_order = CONCAT(tmp_sort_order, '.', LPAD(CAST((select @id := @id + case when @dim = tmp_dim_id then 0 else 1 end) AS CHAR), 5, '0')),
					tmp_dim_id = (select @dim := tmp_dim_id);

				INSERT INTO tmp_recursive
                SELECT
					0,
                    tmp_dim_id,
                    tmp_dim_rec,
                    tmp_dim_id,
                    0 AS tmp_dim_id,
                    tmp_parent_id,
                    tmp_dim_id,
                    lvl,
                    tmp_sort_order
				FROM tmp_add_records
                GROUP BY tmp_dim_id, tmp_dim_rec, tmp_parent_id, tmp_sort_order;

				IF lvl = 0 THEN

					INSERT INTO tmp_recursive
					SELECT
						0,
						marl_id,
						marl_fk_child_dimension,
						marl_id,
						0,
						tmp_madr_id,
                        marl_id,
                        lvl,
                        CONCAT('00001.', LPAD(CAST((select @id := @id + 1) AS CHAR), 5, '0'))
					FROM tmp_records AS tmp
                    JOIN main_dimension_record AS madr
                      ON madr.madr_id = tmp.tmp_madr_id
                    JOIN main_relation AS rel
                      ON rel.marl_fk_parent_dimension = madr.madr_fk_dimension
					WHERE NOT EXISTS
						(SELECT 1 FROM tmp_add_records WHERE tmp_dim_id = rel.marl_id);

				END IF;

            END IF;

			SET lvl = lvl + 1;

			SET @id = 0;

			INSERT INTO tmp_recursive
            SELECT
				0,
                tmp_dim_id,
                tmp_dim_rec,
                tmp_madr_id,
                tmp_marr_id,
                tmp_parent_id,
                tmp_rec_id,
                tmp_level,
                CONCAT(tmp_sort_order, '.', LPAD(CAST((select @id := @id + 1) AS CHAR), 5, '0')) AS tmp_sort_order
			FROM tmp_add_records AS tmp;

		END WHILE;

		ALTER TABLE tmp_recursive ADD tmp_rec_org INT UNSIGNED DEFAULT 0;
        UPDATE tmp_recursive SET tmp_rec_org = tmp_rec_id;

		UPDATE tmp_recursive
		LEFT JOIN main_dimension_record
		  ON madr_id = tmp_rec_id
		SET tmp_rec_id = 
			CASE
				WHEN tmp_madr_id = tmp_rec_id 
				 AND tmp_dim_id = tmp_rec_id
                 AND tmp_parent_id > 0
                 AND tmp_marr_id = 0 THEN tmp_rec_id
				ELSE madr_fk_record
			END,
            tmp_madr_id = COALESCE(tmp_madr_id, madr_id);

		IF pLanguage != '' THEN
			SELECT
				CASE
					WHEN tmp.tmp_marr_id = 0 AND tmp.tmp_parent_id > 0
						THEN CONCAT('madi_', CAST(tmp.tmp_rec_id AS CHAR))
					WHEN tmp.tmp_marr_id = 0
						THEN CONCAT('mare_', CAST(tmp.tmp_rec_id AS CHAR))
-- 					WHEN tmp.tmp_madr_id > 0
-- 						THEN CONCAT('madr_', CAST(tmp.tmp_madr_id AS CHAR))
                    ELSE CONCAT('mare_', CAST(tmp.tmp_rec_id AS CHAR))
				END as tmp_dbid,
				tmp.*,
                -- CASE WHEN marl.marl_id IS NOT NULL THEN (SELECT madi_code FROM main_dimension WHERE madi_id = marl.marl_fk_child_dimension) ELSE madi_code END AS dimension,
                madi_code AS dimension,
                -- CONCAT('madi_', CAST(CASE WHEN tmp.tmp_marr_id > 0 THEN tmp_dim_id ELSE tmp_dim_rec END AS CHAR)) AS tmp_madi,
				-- CONCAT('madi_', CAST(tmp_dim_rec AS CHAR)) AS tmp_marl,
                CONCAT('madi_', CAST(CASE WHEN marl.marl_fk_child_dimension = func_getDimensionID('sys.type.any') THEN marl.marl_fk_child_dimension ELSE tmp_dim_rec END AS CHAR)) AS tmp_marl,
                CONCAT('madi_', CASE
					WHEN tmp.tmp_marr_id > 0 THEN CAST(COALESCE(marl.marl_fk_child_dimension, tmp_dim_id) AS CHAR)
                    -- WHEN tmp.tmp_madr_id = tmp.tmp_rec_id AND tmp.tmp_dim_id = tmp.tmp_rec_id THEN CAST(tmp_dim_id AS CHAR)
                    ELSE CAST(tmp_dim_id AS CHAR)
				END) AS tmp_madi,
                -- CONCAT('madi_', CAST(tmp_dim_rec AS CHAR)) as tmp_madi,
                -- CASE WHEN madr_fk_record IS NOT NULL THEN func_getRecordData(madr_fk_record, func_getDimensionID(pLanguage)) ELSE NULL END AS info,
				CASE WHEN tmp.tmp_rec_id = tmp.tmp_marr_id THEN COALESCE(func_getRecordData(tmp_rec_id, func_getDimensionID(pLanguage)), '{}') ELSE '{}' END AS json,
                func_getRecordData(COALESCE(madr_fk_record, tmp_rec_id), func_getDimensionID(pLanguage)) AS info
-- 			    CASE
-- 					WHEN madr_fk_record IS NOT NULL AND madr_fk_record != tmp_rec_id
--                     THEN func_getRecordData(COALESCE(madr_fk_record, tmp_rec_id), func_getDimensionID(pLanguage))
--                     ELSE '{}'
-- 				END AS info
			FROM tmp_recursive AS tmp
			JOIN main_dimension AS madi
              ON madi_id = tmp_dim_id
			LEFT JOIN main_relation AS marl
              ON marl.marl_id = madi_id
			 AND marl.marl_use_dim_yn = 1
			LEFT JOIN main_relation_record
              ON marr_id = tmp_marr_id
			LEFT JOIN main_dimension_record
              ON madr_id = marr_fk_child
			ORDER BY tmp_sort_order;
		END IF;	

	END //
DELIMITER ;

-- CALL stp_selectRecursiveLevels('madi_37', 'sys.lang.nl', FALSE, 0, 0);

CALL stp_selectRecursive(54, 'sys.lang.nl', TRUE);

-- CALL stp_selectDimension('madi_37', 'sys.lang.nl');