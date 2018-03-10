
DROP PROCEDURE IF EXISTS stp_getBasketItems;
DELIMITER //
CREATE PROCEDURE stp_getBasketItems
	(IN
		pEntityID INT,
		pProgCode VARCHAR(30)
	)
	BEGIN

        IF pEntityID = 0 THEN
			SET pEntityID = func_getRecordID('sys.type.entity', 'sys.attr.code', 'SYS');
        END IF;

		CALL stp_selectRelationRecords(func_getRelationID('sys.type.basket', 'sys.type.item'), 0, 0, 'sys.lang.nl');

		SELECT
			rela_parent_id   AS bask_id,
			rela_parent_code AS bask_code,
			rela_parent_desc AS bask_desc,
			rela_child_id    AS item_id,
			rela_child_code  AS item_code,
			rela_child_desc  AS item_desc,
			0 AS item_order,
			CASE WHEN sel.item_id IS NOT NULL THEN 1 ELSE 0 END as item_count
		FROM tmp_relations AS rel
		LEFT JOIN
		(
			SELECT DISTINCT sere_fk_record AS item_id
			FROM main_selector as sele
			JOIN main_selector_record AS sere
			  ON sere.sere_fk_selector = sele.sele_id
			JOIN main_relation_record as marr
			  ON marr.marr_fk_child = sele.sele_fk_record
			 AND marr.marr_fk_parent = pEntityID
			JOIN main_record_value AS mava
			  ON mava.mava_fk_record = marr.marr_id
			 AND mava.mava_fk_dimension = sele.sele_fk_dimension
			 AND func_runSelector(
				 func_getOptionValue(mava.mava_fk_value, mava.mava_value),
				 sele.sele_operator,
				 func_getOptionValue(sele.sele_fk_value, sele.sele_value),
				 sele.sele_type
				) = 1
		) AS sel ON sel.item_id = rel.rela_child_id
        ORDER BY rela_parent_id, rela_child_id;

	END //
DELIMITER ;

DROP PROCEDURE IF EXISTS stp_getNextProgram;
DELIMITER //
CREATE PROCEDURE stp_getNextProgram
	(IN
		pEntityID INT,
		pProgCode VARCHAR(30)
	)
	BEGIN

		DECLARE prog_id INT UNSIGNED DEFAULT 0;

		SET prog_id = func_getRecordID('sys.type.program', 'sys.attr.code', pProgCode);
		CALL stp_selectDimensionRecord(prog_id, 'sys.lang.nl');

		SELECT
			madr_id AS prog_id,
            0 AS phas_id,
			'' AS phas_code,
            '' AS phas_desc,
			madr_code AS prog_code,
            madr_desc AS prog_desc
		FROM tmp_record;

	END //
DELIMITER ;

-- CALL stp_getQuestions(0, 59);

DROP PROCEDURE IF EXISTS stp_getQuestions;
DELIMITER //
CREATE PROCEDURE stp_getQuestions
	(IN
		pEntityID INT UNSIGNED,
		pProgramID INT UNSIGNED
	)
	BEGIN

        IF pEntityID = 0 THEN
			SET pEntityID = func_getRecordID('sys.type.entity', 'sys.attr.code', 'SYS');
        END IF;

		CALL stp_selectRelationRecords(func_getRelationID('sys.type.program', 'sys.type.question'), pProgramID, 0, 'sys.lang.nl');

		SELECT
			tmp.*,
			CASE WHEN COALESCE(ques_answer, '') = '' THEN 'OPEN' ELSE 'BEANTWOORD' END as ques_status
		FROM
        (
			SELECT
				rela_parent_id   AS mare_id,
				CONCAT(CAST(rela_parent_id AS CHAR), '-', CAST(rela_child_id AS CHAR)) AS mare_code,
				rela_order 		 AS mare_order,
				rela_child_id    AS ques_id,
				rela_child_code  AS ques_code,
				rela_child_desc  AS ques_desc,
				(SELECT GROUP_CONCAT(CASE
					WHEN mava_fk_value IS NOT NULL THEN CONCAT('mare_', CAST(mava_fk_value AS CHAR))
					ELSE mava_value
				 END) COLLATE utf8_bin AS quan_answer
					FROM main_relation_record
					JOIN main_record_value
					  ON mava_fk_record = marr_id
					 AND mava_fk_dimension = func_getDimensionID('sys.attr.answer')
					WHERE marr_fk_parent = pEntityID
					  AND marr_fk_child = rel.rela_child_id
				) AS ques_answer,
				0 AS mrlk_total,
				0 AS mrlk_count
			FROM tmp_relations AS rel
		) AS tmp;

	END //
DELIMITER ;

DROP PROCEDURE IF EXISTS stp_getNextQuestion;
DELIMITER //
CREATE PROCEDURE stp_getNextQuestion
	(IN
		pEntityID INT UNSIGNED,
		pProgramID INT UNSIGNED,
		pAfterOrder INT,
        pToOrder INT
	)
	BEGIN

		DECLARE NextID INT UNSIGNED DEFAULT 0;
        DECLARE HowMany INT UNSIGNED DEFAULT 0;
        
        SET HowMany = CASE WHEN pToOrder > 0 AND pToOrder > pAfterOrder THEN pToOrder - pAfterOrder ELSE 1 END;

		SET NextID = (SELECT prqu.marr_id
		FROM main_relation_record AS prqu
		WHERE prqu.marr_fk_relation = func_getRelationID('sys.type.program', 'sys.type.question')
        AND (prqu.marr_fk_parent = pProgramID OR pProgramID = 0)

		AND ((
		-- func_checkQuestionLink('PROG-QUES-LINK', prqu.mare_fk_child, pEntityID, prog.mare_id) = 0 AND
		  (pAfterOrder = 0 OR prqu.marr_order > pAfterOrder)
			AND
		  (pToOrder <= pAfterOrder OR prqu.marr_order = pToOrder)
		))

		ORDER BY prqu.marr_order
		LIMIT 1);

		/* ======== */

		SELECT
			prqu.marr_fk_child AS ques_id
		FROM main_relation_record AS prqu
		WHERE prqu.marr_fk_relation = func_getRelationID('sys.type.program', 'sys.type.question')
        AND (prqu.marr_fk_parent = pProgramID OR pProgramID = 0)

		  AND (prqu.marr_id = NextID OR (
			prqu.marr_order < (SELECT marr_order FROM main_relation_record WHERE marr_id = NextID) AND prqu.marr_order > pAfterOrder))

		ORDER BY case when prqu.marr_id = NextID THEN 0 ELSE 1 END DESC, prqu.marr_order LIMIT HowMany;

	END //
DELIMITER ;

DROP PROCEDURE IF EXISTS stp_getQuestion;
DELIMITER //
CREATE PROCEDURE stp_getQuestion
	(IN
		pQuesID INT UNSIGNED,
		pEntityID INT UNSIGNED,
        pLanguage VARCHAR(255)
	)
	BEGIN

		DECLARE langid INT UNSIGNED DEFAULT 0;
        DECLARE attrid INT UNSIGNED DEFAULT 0;
        
        SET langid = func_getDimensionID(pLanguage);
		SET attrid = func_getDimensionID('sys.attr.answer');

        IF pEntityID = 0 THEN
			SET pEntityID = func_getRecordID('sys.type.entity', 'sys.attr.code', 'SYS');
        END IF;

		CALL stp_selectDimensionRecord(pQuesID, pLanguage);

		SELECT
			tmp.*,
            CASE WHEN COALESCE(quan_answer, '') = '' THEN 'OPEN' ELSE 'BEANTWOORD' END as ques_status
		FROM
        (
			SELECT
				marr_id AS mare_id,
				marr_order AS mare_order,
				CONCAT(CAST(marr.marr_fk_parent AS CHAR), '-', CAST(tmp.madr_id AS CHAR)) AS mare_code,
				madr_id AS ques_id,
				mava_value AS ques_type,
				madr_desc AS ques_desc,
				CASE
					WHEN mava_value = 'choice' THEN 'radio'
					WHEN mava_value = 'multiple' THEN 'multiple'
					ELSE 'input'
				END AS ques_tag,
				pEntityID AS enti_id,
				(SELECT GROUP_CONCAT(CASE
					WHEN mava_fk_value IS NOT NULL THEN CONCAT('mare_', CAST(mava_fk_value AS CHAR))
					ELSE mava_value
				 END) COLLATE utf8_bin AS quan_answer
					FROM main_relation_record
					JOIN main_record_value
					  ON mava_fk_record = marr_id
					 AND mava_fk_dimension = attrid
					WHERE marr_fk_parent = pEntityID
					  AND marr_fk_child = pQuesID
				) AS quan_answer
			FROM tmp_record AS tmp
			JOIN main_relation_record AS marr
			  ON marr.marr_fk_child = tmp.madr_id
			 AND marr.marr_fk_relation = func_getRelationID('sys.type.program', 'sys.type.question')
			JOIN main_record_value AS mava
			  ON mava.mava_fk_record = tmp.madr_fk_record
			 AND mava.mava_fk_dimension = func_getDimensionID('sys.attr.type')
			 AND mava.mava_fk_language = 1
		) AS tmp;

	END //
DELIMITER ;

DROP PROCEDURE IF EXISTS stp_getQuestionOption;
DELIMITER //
CREATE PROCEDURE stp_getQuestionOption
	(IN
		pQuestionID INT,
		pEntityID INT,
        pLanguage VARCHAR(255)
	)
	BEGIN

		SELECT
			marr_id as quop_id,
            mava_value as quop_description,
            mava_id as quop_order
        FROM main_relation_record
        JOIN main_dimension_record
          ON madr_id = marr_fk_child
		 AND madr_fk_dimension = func_getDimensionID('sys.type.option')
		JOIN main_record_value
          ON mava_fk_record = madr_fk_record
		 AND mava_fk_dimension = func_getDimensionID('sys.attr.desc')
         AND mava_fk_language = COALESCE(func_getDimensionID(pLanguage), func_getDimensionID('sys.lang.nl'))
		WHERE marr_fk_parent = pQuestionID;

	END //
DELIMITER ;

DROP PROCEDURE IF EXISTS stp_saveAnswer;
DELIMITER //
CREATE PROCEDURE stp_saveAnswer
	(IN
		pQuestionID INT UNSIGNED,
		pEntityID INT UNSIGNED,
        pRecordID INT UNSIGNED,
		pAnswer VARCHAR(1000)
	)
	BEGIN

		DECLARE answerid INT UNSIGNED DEFAULT 0;
        DECLARE answerdim INT UNSIGNED DEFAULT 0;
        DECLARE resultid INT UNSIGNED DEFAULT 0;

		DECLARE existing INT DEFAULT 0;
		DECLARE multiple BOOLEAN;
		DECLARE fkoption INT UNSIGNED DEFAULT 0;
		DECLARE answer VARCHAR(255);
		
        IF pEntityID = 0 THEN
			SET pEntityID = func_getRecordID('sys.type.entity', 'sys.attr.code', 'SYS');
        END IF;
        
		SET multiple = IF(
			(SELECT 1
				FROM main_dimension_record
				JOIN main_record_value
				  ON mava_fk_record = madr_fk_record
				 AND mava_fk_dimension = func_getDimensionID('sys.attr.type')
                 AND mava_value = 'multiple'
				WHERE madr_id = pQuestionID), TRUE, FALSE);

		SET answerdim = func_getDimensionID('sys.attr.answer');
		CALL stp_upsertRelationRecord(func_getDimensionID('sys.type.entity.question'), pEntityID, pQuestionID, 0, answerid);

		IF multiple THEN

			DROP TEMPORARY TABLE IF EXISTS tmp_answers;
			CREATE TEMPORARY TABLE tmp_answers (tmp_id INT UNSIGNED NOT NULL);

			IF TRIM(pAnswer) > '' THEN
				SET pAnswer = CONCAT(TRIM(pAnswer), ',');

				WHILE LOCATE(',', pAnswer) > 0 DO

					SET answer   = TRIM(SUBSTRING(pAnswer, 1, LOCATE(',', pAnswer) - 1));
					SET pAnswer  = TRIM(SUBSTRING(pAnswer, LOCATE(',', pAnswer) + 1, 1000));
					SET fkoption = CAST(SUBSTRING(answer, 6) AS UNSIGNED);
					
					INSERT INTO tmp_answers VALUES (fkoption);
					SET existing = IF(
						(SELECT mava_id
							FROM main_record_value
								WHERE mava_fk_record = answerid
								  AND mava_fk_dimension = answerdim
								  AND mava_fk_value = fkoption), TRUE, FALSE);

					IF NOT existing THEN
                        INSERT INTO main_record_value VALUES (0, answerid, answerdim, 1, fkoption, '');
					END IF;

				END WHILE;
			END IF;

			DELETE quan
			FROM main_record_value AS quan
			WHERE mava_fk_record = answerid
			  AND mava_fk_dimension = answerdim
			  AND NOT EXISTS
				(SELECT 1 FROM tmp_answers WHERE tmp_id = quan.mava_fk_value);
			
		ELSE
			SELECT mava_id INTO existing
				FROM main_record_value
					WHERE mava_fk_record = answerid
					  AND mava_fk_dimension = answerdim;
			
			IF SUBSTRING(pAnswer, 1, 4) = 'mare' THEN
				SET fkoption = CAST(SUBSTRING(pAnswer, 6) AS UNSIGNED);
			END IF;

			IF existing > 0 THEN
				UPDATE main_record_value
				   SET mava_fk_value = case when fkoption > 0 then fkoption else null end,
					   mava_value = case when fkoption > 0 then '' else pAnswer end
				WHERE mava_id = existing;
			ELSE

				INSERT INTO main_record_value VALUES (0, answerid, answerdim, 1, case when fkoption > 0 then fkoption else null end, case when fkoption > 0 then '' else pAnswer end);

			END IF;

		END IF;

		SELECT *
		FROM main_record_value
		WHERE mava_fk_record = answerid
		  AND mava_fk_dimension = answerdim;

	END //
DELIMITER ;

/*
CALL purejs_gdpr.stp_getQuestions(0, 34);
CALL stp_getQuestions(0, 62);
select * from tmp_relations;

CALL purejs_gdpr.stp_getNextQuestion(0, 34, 0);
CALL stp_getNextQuestion(0, 62, 0);
CALL purejs_gdpr.stp_getQuestion(13, 0);
CALL stp_getQuestion(5, 0, 'sys.lang.nl');

*/


