CALL stp_selectMeta('madi_2', 'sys.lang.nl');
SELECT * FROM main_dimension 
WHERE madi_code NOT LIKE 'sys.attr%' AND madi_code NOT LIKE 'sys.type%'
ORDER BY madi_code;-- WHERE madi_id = 199;
SELECT * FROM main_record_value WHERE mava_fk_record = 2;
INSERT INTO `main_dimension` SELECT @sys_id, 'sys', @sys_id, NULL FROM (SELECT 1) AS tmp WHERE NOT EXISTS (SELECT 1 FROM `main_dimension` WHERE madi_id = 1);

CALL stp_upsertDimension('sys', 'attr', @attr_id);
CALL stp_upsertDimension('sys.attr', 'code', @code_id);
-- !CORRIGEREN!
CALL stp_upsertDimension('sys.attr', 'type', @type_id);
CALL stp_upsertDimension('sys.attr', 'desc', @desc_id);
CALL stp_upsertDimension('sys.attr', 'options', @options_id);
CALL stp_upsertDimension('sys.attr', 'answer', @answer_id);
CALL stp_upsertDimension('sys.attr', 'class', @class_id);
CALL stp_upsertDimension('sys.attr', 'label', @label_id);
CALL stp_upsertDimension('sys.attr', 'prefix', @prefix_id);
CALL stp_upsertDimension('sys.attr', 'tag', @tag_id);
CALL stp_upsertDimension('sys.attr', 'icon', @icon_id);

CALL stp_upsertDimension('sys', 'meta', @meta_id);
CALL stp_upsertDimension('sys.meta', 'desc', @meta_desc_id);
CALL stp_upsertRecordValue(func_getDimensionID('sys.attr'), @meta_desc_id, 'sys', 'label', 0, @attr_id);
CALL stp_upsertDimension('sys.meta', 'query', @meta_query_id);
CALL stp_upsertRecordValue(func_getDimensionID('sys.type.endpoint.type'), @meta_query_id, 'sys', 'lookup', 0, @attr_id);

CALL stp_upsertDimension('sys.meta', 'form', @meta_form_id);
CALL stp_upsertRecordValue(func_getDimensionID('sys.type.question'), @meta_form_id, 'sys', 'modules/player/components/question/question', 0, @attr_id);

INSERT INTO main_dimension_record VALUES (0, @attr_id, @label_id, 0);
INSERT INTO main_dimension_record VALUES (0, @attr_id, @type_id, 0);
INSERT INTO main_dimension_record VALUES (0, @attr_id, @tag_id, 0);


INSERT INTO main_dimension_record VALUES (0, @code_id, @label_id, 0);
INSERT INTO main_dimension_record VALUES (0, @code_id, @type_id, 0);
INSERT INTO main_dimension_record VALUES (0, @code_id, @tag_id, 0);
CALL stp_upsertRecordValue(func_getDimensionID('sys.attr.code'), @label_id, 'sys.lang.nl', 'Code', 0, @attr_id);
CALL stp_upsertRecordValue(func_getDimensionID('sys.attr.code'), @type_id, 'sys', 'string', 0, @attr_id);
CALL stp_upsertRecordValue(func_getDimensionID('sys.attr.code'), @tag_id, 'sys', 'input', 0, @attr_id);
INSERT INTO main_dimension_record VALUES (0, @desc_id, @label_id, 0);
INSERT INTO main_dimension_record VALUES (0, @desc_id, @type_id, 0);
INSERT INTO main_dimension_record VALUES (0, @desc_id, @tag_id, 0);
CALL stp_upsertRecordValue(func_getDimensionID('sys.attr.desc'), @label_id, 'sys.lang.nl', 'Omschrijving', 0, @attr_id);
CALL stp_upsertRecordValue(func_getDimensionID('sys.attr.desc'), @type_id, 'sys', 'string', 0, @attr_id);
CALL stp_upsertRecordValue(func_getDimensionID('sys.attr.desc'), @tag_id, 'sys', 'input', 0, @attr_id);
INSERT INTO main_dimension_record VALUES (0, @type_id, @label_id, 0);
INSERT INTO main_dimension_record VALUES (0, @type_id, @type_id, 0);
INSERT INTO main_dimension_record VALUES (0, @type_id, @tag_id, 0);
CALL stp_upsertRecordValue(func_getDimensionID('sys.attr.type'), @label_id, 'sys.lang.nl', 'Type', 0, @attr_id);
CALL stp_upsertRecordValue(func_getDimensionID('sys.attr.type'), @type_id, 'sys', 'string', 0, @attr_id);
CALL stp_upsertRecordValue(func_getDimensionID('sys.attr.type'), @tag_id, 'sys', 'input', 0, @attr_id);
INSERT INTO main_dimension_record VALUES (0, @class_id, @label_id, 0);
INSERT INTO main_dimension_record VALUES (0, @class_id, @type_id, 0);
INSERT INTO main_dimension_record VALUES (0, @class_id, @tag_id, 0);
CALL stp_upsertRecordValue(func_getDimensionID('sys.attr.class'), @label_id, 'sys.lang.nl', 'Class', 0, @attr_id);
CALL stp_upsertRecordValue(func_getDimensionID('sys.attr.class'), @type_id, 'sys', 'string', 0, @attr_id);
CALL stp_upsertRecordValue(func_getDimensionID('sys.attr.class'), @tag_id, 'sys', 'input', 0, @attr_id);
INSERT INTO main_dimension_record VALUES (0, @icon_id, @label_id, 0);
INSERT INTO main_dimension_record VALUES (0, @icon_id, @type_id, 0);
INSERT INTO main_dimension_record VALUES (0, @icon_id, @tag_id, 0);
CALL stp_upsertRecordValue(func_getDimensionID('sys.attr.icon'), @label_id, 'sys.lang.nl', 'Icon', 0, @attr_id);
CALL stp_upsertRecordValue(func_getDimensionID('sys.attr.icon'), @type_id, 'sys', 'string', 0, @attr_id);
CALL stp_upsertRecordValue(func_getDimensionID('sys.attr.icon'), @tag_id, 'sys', 'fas', 0, @attr_id);
INSERT INTO main_dimension_record VALUES (0, @label_id, @label_id, 0);
INSERT INTO main_dimension_record VALUES (0, @label_id, @type_id, 0);
INSERT INTO main_dimension_record VALUES (0, @label_id, @tag_id, 0);
CALL stp_upsertRecordValue(func_getDimensionID('sys.attr.label'), @label_id, 'sys.lang.nl', 'Label', 0, @attr_id);
CALL stp_upsertRecordValue(func_getDimensionID('sys.attr.label'), @type_id, 'sys', 'string', 0, @attr_id);
CALL stp_upsertRecordValue(func_getDimensionID('sys.attr.label'), @tag_id, 'sys', 'fas', 0, @attr_id);
INSERT INTO main_dimension_record VALUES (0, @tag_id, @label_id, 0);
INSERT INTO main_dimension_record VALUES (0, @tag_id, @type_id, 0);
INSERT INTO main_dimension_record VALUES (0, @tag_id, @tag_id, 0);
CALL stp_upsertRecordValue(func_getDimensionID('sys.attr.tag'), @label_id, 'sys.lang.nl', 'Tag', 0, @attr_id);
CALL stp_upsertRecordValue(func_getDimensionID('sys.attr.tag'), @type_id, 'sys', 'string', 0, @attr_id);
CALL stp_upsertRecordValue(func_getDimensionID('sys.attr.tag'), @tag_id, 'sys', 'fas', 0, @attr_id);




INSERT INTO main_dimension_record VALUES (0, @code_id, @label_id, 0);
INSERT INTO main_dimension_record VALUES (0, @code_id, @type_id, 0);
INSERT INTO main_dimension_record VALUES (0, @code_id, @tag_id, 0);
CALL stp_upsertRecordValue(func_getDimensionID('sys.attr.code'), @label_id, 'sys.lang.nl', 'Code', 0, @attr_id);
CALL stp_upsertRecordValue(func_getDimensionID('sys.attr.code'), @type_id, 'sys', 'string', 0, @attr_id);
CALL stp_upsertRecordValue(func_getDimensionID('sys.attr.code'), @tag_id, 'sys', 'input', 0, @attr_id);

INSERT INTO main_dimension_record VALUES (0, @desc_id, @label_id, 0);
INSERT INTO main_dimension_record VALUES (0, @desc_id, @type_id, 0);
INSERT INTO main_dimension_record VALUES (0, @desc_id, @tag_id, 0);
CALL stp_upsertRecordValue(func_getDimensionID('sys.attr.desc'), @label_id, 'sys.lang.nl', 'Omschrijving', 0, @attr_id);
CALL stp_upsertRecordValue(func_getDimensionID('sys.attr.desc'), @type_id, 'sys', 'string', 0, @attr_id);
CALL stp_upsertRecordValue(func_getDimensionID('sys.attr.desc'), @tag_id, 'sys', 'input', 0, @attr_id);

INSERT INTO main_dimension_record VALUES (0, @class_id, @label_id, 0);
INSERT INTO main_dimension_record VALUES (0, @class_id, @type_id, 0);
INSERT INTO main_dimension_record VALUES (0, @class_id, @tag_id, 0);
CALL stp_upsertRecordValue(func_getDimensionID('sys.attr.class'), @label_id, 'sys.lang.nl', 'Class', 0, @attr_id);
CALL stp_upsertRecordValue(func_getDimensionID('sys.attr.class'), @type_id, 'sys', 'string', 0, @attr_id);
CALL stp_upsertRecordValue(func_getDimensionID('sys.attr.class'), @tag_id, 'sys', 'input', 0, @attr_id);

INSERT INTO main_dimension_record VALUES (0, @icon_id, @label_id, 0);
INSERT INTO main_dimension_record VALUES (0, @icon_id, @type_id, 0);
INSERT INTO main_dimension_record VALUES (0, @icon_id, @tag_id, 0);
CALL stp_upsertRecordValue(func_getDimensionID('sys.attr.icon'), @label_id, 'sys.lang.nl', 'Icon', 0, @attr_id);
CALL stp_upsertRecordValue(func_getDimensionID('sys.attr.icon'), @type_id, 'sys', 'string', 0, @attr_id);
CALL stp_upsertRecordValue(func_getDimensionID('sys.attr.icon'), @tag_id, 'sys', 'fas', 0, @attr_id);

INSERT INTO main_dimension_record VALUES (0, @route_id, @label_id, 0);
INSERT INTO main_dimension_record VALUES (0, @route_id, @type_id, 0);
INSERT INTO main_dimension_record VALUES (0, @route_id, @tag_id, 0);
CALL stp_upsertRecordValue(@route_id, @label_id, 'sys.lang.nl', 'Route', 0, @attr_id);
CALL stp_upsertRecordValue(@route_id, @type_id, 'sys', 'string', 0, @attr_id);
CALL stp_upsertRecordValue(@route_id, @tag_id, 'sys', 'input', 0, @attr_id);

SET @answer_id = func_getDimensionID('sys.attr.answer');
INSERT INTO main_dimension_record VALUES (0, @answer_id, func_getDimensionID('sys.attr.answer'), 0);
INSERT INTO main_dimension_record VALUES (0, @answer_id, func_getDimensionID('sys.attr.answer'), 0);
INSERT INTO main_dimension_record VALUES (0, @answer_id, func_getDimensionID('sys.attr.answer'), 0);
CALL stp_upsertRecordValue(@answer_id, func_getDimensionID('sys.attr.label'), 'sys.lang.nl', 'Antwoord', 0, @attr_id);
CALL stp_upsertRecordValue(@answer_id, func_getDimensionID('sys.attr.type'), 'sys', 'string', 0, @attr_id);
CALL stp_upsertRecordValue(@answer_id, func_getDimensionID('sys.attr.tag'), 'sys', 'input', 0, @attr_id);

SELECT * FROM main_record_value ORDER BY mava_id DESC;

CALL stp_upsertDimension('sys', 'event', @evt_id);
CALL stp_upsertDimension('sys.event', 'click', @click_id);
CALL stp_upsertRecordValue(func_getDimensionID('sys.event.click'), @label_id, 'sys.lang.nl', 'Click', 0, @attr_id);
CALL stp_upsertRecordValue(func_getDimensionID('sys.event.click'), @type_id, 'sys', 'string', 0, @attr_id);
CALL stp_upsertRecordValue(func_getDimensionID('sys.event.click'), @tag_id, 'sys', 'input', 0, @attr_id);


CALL stp_upsertDimension('sys', 'rela', @rela_id);
CALL stp_upsertDimension('sys', 'type', @type_id);
INSERT INTO main_dimension_record VALUES (0, @type_id, func_getDimensionID('sys.attr.desc'), 0);

SELECT * FROM main_record_value WHERE mava_value = 'sys.type.item';
INSERT INTO main_record_value VALUES (0, 15, 4, 20, NULL, 'Maatregelen');

CALL stp_upsertDimension('sys.type', 'department', @dep_id);
INSERT INTO main_dimension_record VALUES (0, @dep_id, func_getDimensionID('sys.attr.code'), 0);
INSERT INTO main_dimension_record VALUES (0, @dep_id, func_getDimensionID('sys.attr.desc'), 0);

CALL stp_upsertDimension('sys.type', 'system', @system_id);
INSERT INTO main_dimension_record VALUES (0, @system_id, func_getDimensionID('sys.attr.code'), 0);
INSERT INTO main_dimension_record VALUES (0, @system_id, func_getDimensionID('sys.attr.desc'), 0);
CALL stp_upsertRecordValue(func_getDimensionID('sys.type.system'), @prefix_id, 'sys.lang.nl', 'sys', 0, @attr_id);

CALL stp_upsertDimension('sys.type', 'user', @user_id);

CALL stp_upsertMainRecord(func_getDimensionID('sys.type.user'), 'admin', 0, @mare_id);
CALL stp_upsertDimensionRecord('sys.type.user', 'admin', @admin_id);
INSERT INTO main_user VALUES (@admin_id, 'admin', 'admin');

CALL stp_upsertDimension('sys.type', 'entity', @enti_id);
INSERT INTO main_dimension_record VALUES (0, @enti_id, @desc_id, 0);
CALL stp_upsertDimension('sys.type', 'question', @ques_id);
INSERT INTO main_dimension_record VALUES (0, @ques_id, @options_id, 0);
INSERT INTO main_dimension_record VALUES (0, @ques_id, @type_id, 0);
INSERT INTO main_dimension_record VALUES (0, @ques_id, func_getDimensionID('sys.attr.code'), 0);
INSERT INTO main_dimension_record VALUES (0, @ques_id, func_getDimensionID('sys.attr.desc'), 0);
CALL stp_upsertRelation('sys.type.entity', 'sys.type.question', @bait_id);
INSERT INTO main_dimension_record VALUES (0, @bait_id, func_getDimensionID('sys.attr.answer'), 0);
-- select * from main_dimension_record where madr_fk_dimension = 6;
-- select func_getDimensionID('sys.attr.answer');

CALL stp_upsertDimension('sys.type', 'option', @option_id);
INSERT INTO main_dimension_record VALUES (0, @option_id, func_getDimensionID('sys.attr.desc'), 0);
CALL stp_upsertRecordValue(@option_id, 'sys.attr.desc', 'sys.lang.nl', 'Opties', 0, @attr_id);
CALL stp_upsertRelation('sys.type.question', 'sys.type.option', @ques_option_id);

CALL stp_upsertRelation('sys.type.entity', 'sys.type.department', @entity_dep_id);
INSERT INTO main_dimension_record VALUES (0, @system_id, func_getDimensionID('sys.attr.code'), 0);
INSERT INTO main_dimension_record VALUES (0, @system_id, func_getDimensionID('sys.attr.desc'), 0);

CALL stp_upsertDimension('sys.type.entity', 'system', @system_id);
INSERT INTO main_dimension_record VALUES (0, @system_id, func_getDimensionID('sys.attr.code'), 0);
INSERT INTO main_dimension_record VALUES (0, @system_id, func_getDimensionID('sys.attr.desc'), 0);
CALL stp_upsertRelation('sys.type.entity', 'sys.type.system', @entity_sys_id);

CALL stp_upsertDimension('sys.type.entity', 'project', @project_id);
INSERT INTO main_dimension_record VALUES (0, @project_id, func_getDimensionID('sys.attr.code'), 0);
INSERT INTO main_dimension_record VALUES (0, @project_id, func_getDimensionID('sys.attr.desc'), 0);

CALL stp_upsertDimension('sys.type.entity', 'item', @item_id);

CALL stp_upsertDimension('sys.type', 'basket', @bask_id);
INSERT INTO main_dimension_record VALUES (0, @bask_id, func_getDimensionID('sys.attr.desc'), 0);
CALL stp_upsertDimension('sys.type', 'item', @item_id);
INSERT INTO main_dimension_record VALUES (0, @item_id, func_getDimensionID('sys.attr.desc'), 0);
CALL stp_upsertDimension('sys.type', 'tag', @tag_id);

CALL stp_upsertDimension('sys.type', 'program', @prog_id);
INSERT INTO main_dimension_record VALUES (0, @prog_id, func_getDimensionID('sys.attr.desc'), 0);

CALL stp_upsertRelation('sys.type.basket', 'sys.type.item', @bait_id);
CALL stp_upsertRelation('sys.type.program', 'sys.type.question', @prog_ques_id);

CALL stp_upsertDimension('sys', 'lang', @type_id);
CALL stp_upsertDimension('sys.lang', 'en', @type_id);
CALL stp_upsertDimension('sys.lang', 'nl', @type_id);

CALL stp_upsertDimension('sys', 'app', @app_id);
INSERT INTO main_dimension_record VALUES (0, @app_id, func_getDimensionID('sys.attr.desc'), 0);

CALL stp_upsertDimension('sys.app', 'menu', @app_menu_id);
INSERT INTO main_dimension_record VALUES (0, @app_menu_id, func_getDimensionID('sys.attr.desc'), 0);

CALL stp_upsertDimension('sys.app', 'item', @app_item_id);
INSERT INTO main_dimension_record VALUES (0, @app_item_id, @app_item_id, 0);
SET @app_item_id = LAST_INSERT_ID();
INSERT INTO main_relation VALUES (2, 1, 2);
INSERT INTO main_dimension_record VALUES (0, @app_item_id, func_getDimensionID('sys.attr.code'), 0);
INSERT INTO main_dimension_record VALUES (0, @app_item_id, func_getDimensionID('sys.attr.desc'), 0);
INSERT INTO main_dimension_record VALUES (0, @app_item_id, func_getDimensionID('sys.attr.class'), 0);
INSERT INTO main_dimension_record VALUES (0, @app_item_id, func_getDimensionID('sys.attr.icon'), 0);
INSERT INTO main_dimension_record VALUES (0, @app_item_id, func_getDimensionID('sys.event.click'), 0);
SELECT func_getRecordID('sys.attr', 'sys.attr.code', 'code');
CALL stp_upsertRelationRecord(2, 133, func_getRecordID('sys.attr', 'sys.attr.code', 'code'), 0, @rela_id);

INSERT INTO main_dimension_record VALUES (0, 2, func_getDimensionID('sys.attr.desc'), 0);
select func_getRecordID('sys.attr', 'sys.attr.code', 'code');
select func_getDimensionID('madi_3');
select func_getRecordData(271, 'sys.lang.nl');
select * from main_relation_record where marr_id = 271;

select func_getRelationID('sys.type.program', 'sys.type.department');

select *
, func_getRecordData(madr_fk_record, 'sys.lang.nl')
from main_dimension_record
-- where madr_fk_dimension = 2
order by madr_id desc;
SELECT func_getDimensionID('madi_136');
CALL stp_deleteDimension(func_getRelationID('sys.type.program', 'sys.type.department'), FALSE, TRUE);

SELECT * FROM main_dimension ORDER BY madi_id DESC;

SELECT *
FROM main_dimension_record AS madr
LEFT JOIN main_dimension AS is_madi
  ON is_madi.madi_id = madr.madr_fk_record
JOIN main_dimension AS madi
  ON madi.madi_id = madr.madr_fk_dimension
GROUP BY madi.madi_id
ORDER BY madi.madi_code;

CALL stp_upsertRelation('sys.app.menu', 'sys.app.item', @app_menu_item_id);
START TRANSACTION;
CALL stp_upsertRelation('sys.app.item', 'sys.app.item', @app_menu_item_id);
COMMIT;
SELECT * FROM main_dimension ORDER BY madi_id DESC;