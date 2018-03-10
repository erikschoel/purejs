

DROP PROCEDURE IF EXISTS stp_getProgramTasks;

DELIMITER //
CREATE PROCEDURE stp_getProgramTasks
	(IN
		pEntityID INT,
        pTaskID INT
	)
	BEGIN

        DECLARE rowcount INT DEFAULT 0;
        DECLARE lvl INT DEFAULT 0;

		DROP TABLE IF EXISTS tmp_tasks;
		CREATE TABLE tmp_tasks
        (
			tmp_id int(10) unsigned auto_increment,
            tmp_parent_id int(10) unsigned null,
            tmp_task_id int(10) unsigned not null,
            tmp_task_fk_parent int(10) unsigned null,
            tmp_level int(10) unsigned not null,
			tmp_sort_order varchar(500) not null,
            primary key (tmp_id)
		);

        INSERT INTO tmp_tasks
        SELECT 0, null, prta_id, prta_fk_parent, lvl, ''
        FROM org_program_task
        WHERE prta_id = pTaskID;
        
        UPDATE tmp_tasks
        SET tmp_sort_order = LPAD(CAST(tmp_id AS CHAR), 5, '0');

        SET rowcount = ROW_COUNT();
        
		WHILE rowcount > 0 DO

			DROP TEMPORARY TABLE IF EXISTS tmp_add_tasks;
            CREATE TEMPORARY TABLE tmp_add_tasks AS
            SELECT tmp_id, prta_id, prta_fk_parent, tmp_sort_order
            FROM tmp_tasks AS tmp
            JOIN org_program_task AS task
              ON task.prta_fk_parent = tmp.tmp_task_id
			WHERE tmp_level = lvl
			ORDER BY tmp_id;

			SET rowcount = ROW_COUNT();
			SET lvl = lvl + 1;

			SET @id = 0;

			INSERT INTO tmp_tasks
            SELECT
				0, tmp_id, prta_id, prta_fk_parent, lvl,
                CONCAT(tmp_sort_order, '.', LPAD(CAST((select @id := @id + 1) AS CHAR), 5, '0'))
			FROM tmp_add_tasks AS tmp;

		END WHILE;

		SELECT
			prta_id, prta_code, prta_description,
            orun_id, orun_code, orun_description,
            DATE_FORMAT(ptin_start_date, '%d-%c-%Y') as ptin_start_date,
            DATE_FORMAT(ptin_deadline, '%d-%c-%Y') as ptin_deadline,
            ptin_perc_complete,
            COALESCE((select orgr_description from org_role where orgr_id = tinst.ptin_fk_role), '') as ptin_role,
            COALESCE((select orgr_description from org_role where orgr_id = tinst.ptin_fk_stakeholder), '') as ptin_stakeholder
        FROM tmp_tasks AS tmp
        JOIN org_program_task AS task
          ON task.prta_id = tmp.tmp_task_id
		JOIN org_unit AS unit
          ON unit.orun_id = task.prta_fk_org_unit
		JOIN org_program_task_instance AS tinst
          ON tinst.ptin_fk_program_task = task.prta_id;

	END //
DELIMITER ;

-- select * from org_role;
-- select * from org_program_task_instance;

CALL stp_getProgramTasks(0, 182);

-- SELECT ROW_COUNT();
-- select * from org_program_task;

