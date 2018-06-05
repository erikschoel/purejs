INSERT INTO `main_record`
SELECT 1, 1, CURRENT_TIMESTAMP(), 'system', null, null FROM (SELECT 1) AS tmp WHERE NOT EXISTS (SELECT 1 FROM `main_record` WHERE mare_id = 1);
SET @mare_id = 1;

INSERT INTO `main_record_value` (mava_id, mava_fk_record, mava_fk_dimension, mava_fk_language, mava_fk_value, mava_value)
SELECT 1, @mare_id, @mare_id, @mare_id, null, 'system' FROM (SELECT 1) AS tmp WHERE NOT EXISTS (SELECT 1 FROM `main_record_value` WHERE mava_fk_record = 1);
SET @sys_id = 1;

INSERT INTO `main_dimension`
SELECT @sys_id, 'sys', @sys_id, NULL
FROM (SELECT 1) AS tmp 
WHERE NOT EXISTS (SELECT 1 FROM `main_dimension` WHERE madi_id = 1);

CALL stp_upsertDimension('sys', 'attr', @attr_id);
CALL stp_upsertDimension('sys.attr', 'code', @code_id);
CALL stp_upsertDimension('sys.attr', 'type', @type_id);
CALL stp_upsertDimension('sys.attr', 'desc', @desc_id);
CALL stp_upsertDimension('sys.attr', 'options', @options_id);
CALL stp_upsertDimension('sys.attr', 'class', @class_id);
CALL stp_upsertDimension('sys.attr', 'label', @label_id);
CALL stp_upsertDimension('sys.attr', 'prefix', @prefix_id);
CALL stp_upsertDimension('sys.attr', 'tag', @tag_id);
CALL stp_upsertDimension('sys.attr', 'icon', @icon_id);
CALL stp_upsertDimension('sys.attr', 'route', @route_id);
CALL stp_upsertDimension('sys.attr', 'module', @module_id);
CALL stp_upsertDimension('sys.attr', 'path', @path_id);
CALL stp_upsertDimension('sys.attr', 'name', @name_id);
CALL stp_upsertDimension('sys', 'event', @evt_id);
CALL stp_upsertDimension('sys.event', 'click', @click_id);

UPDATE main_record_value SET mava_fk_dimension = @code_id WHERE mava_fk_dimension = @attr_id;

CALL stp_upsertDimension('sys', 'lang', @lang_id);
CALL stp_upsertDimension('sys.lang', 'en', @lang_id);
CALL stp_upsertDimension('sys.lang', 'nl', @lang_id);

INSERT INTO main_dimension_record VALUES (0, @attr_id, @code_id, 0);
INSERT INTO main_dimension_record VALUES (0, @attr_id, @label_id, 0);
INSERT INTO main_dimension_record VALUES (0, @attr_id, @type_id, 0);
INSERT INTO main_dimension_record VALUES (0, @attr_id, @tag_id, 0);

CALL stp_upsertRecordValue(@attr_id, func_getDimensionID('sys.attr.type'), 'sys', 'string', 0, @val_id);
CALL stp_upsertRecordValue(@attr_id, func_getDimensionID('sys.attr.tag'), 'sys', 'input', 0, @val_id);
CALL stp_upsertRecordValue(@tag_id, func_getDimensionID('sys.attr.tag'), 'sys', 'select', 0, @val_id);

INSERT INTO main_dimension_record VALUES (0, @tag_id, @desc_id, 0);
CALL stp_upsertDimensionRecord(@tag_id, 'input', @val_id);
CALL stp_upsertDimensionRecord(@tag_id, 'select', @val_id);
CALL stp_upsertDimensionRecord(@tag_id, 'textarea', @val_id);
CALL stp_upsertDimensionRecord(@tag_id, 'checkbox', @val_id);
CALL stp_upsertDimensionRecord(@tag_id, 'multiple', @val_id);
CALL stp_upsertDimensionRecord(@tag_id, 'radio', @val_id);
CALL stp_upsertDimensionRecord(@tag_id, 'fas', @val_id);
CALL stp_upsertDimensionRecord(@tag_id, 'record', @val_id);
CALL stp_upsertDimensionRecord(@tag_id, 'panel', @val_id);
CALL stp_upsertDimensionRecord(@tag_id, 'func', @val_id);

UPDATE main_record_value
JOIN main_dimension_record ON madr_id = func_getRecordID('sys.attr.tag', 'sys.attr.code', mava_value)
SET mava_fk_value = madr_fk_record
WHERE mava_fk_dimension = @tag_id;

CALL stp_upsertDimension('sys', 'meta', @meta_id);
CALL stp_upsertDimension('sys.meta', 'desc', @meta_desc_id);
CALL stp_upsertRecordValue(func_getDimensionID('sys.attr'), @meta_desc_id, 'sys', 'attr.label', 0, @attr_id);

/*

INSERT INTO main_dimension_record VALUES (0, @attr_id, @code_id, 0);
INSERT INTO main_dimension_record VALUES (0, @attr_id, @desc_id, 0);

CALL stp_upsertRecordValue(func_getDimensionID('sys.attr'), func_getDimensionID('sys.attr.type'), 'sys', 'string', 0, @val_id);
CALL stp_upsertRecordValue(func_getDimensionID('sys.attr'), func_getDimensionID('sys.attr.tag'), 'sys', 'input', 0, @val_id);


INSERT INTO main_dimension_record VALUES (0, @type_id, @label_id, 0);
INSERT INTO main_dimension_record VALUES (0, @type_id, @type_id, 0);
INSERT INTO main_dimension_record VALUES (0, @type_id, @tag_id, 0);
CALL stp_upsertRecordValue(func_getDimensionID('sys.attr.type'), @label_id, 'sys.lang.nl', 'Type', 0, @attr_id);
CALL stp_upsertRecordValue(func_getDimensionID('sys.attr.type'), @type_id, 'sys', 'string', 0, @attr_id);
CALL stp_upsertRecordValue(func_getDimensionID('sys.attr.type'), @tag_id, 'sys', 'input', 0, @attr_id);

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
*/

CALL stp_upsertDimension('sys', 'type', @type_id);
CALL stp_upsertDimension('sys.type', 'any', @any_id);
CALL stp_upsertDimension('sys.type', 'user', @user_id);
-- CALL stp_upsertMainRecord(func_getDimensionID('sys.type.user'), 'admin', 0, @mare_id);
CALL stp_upsertDimensionRecord('sys.type.user', 'admin', @admin_id);
INSERT INTO main_user SELECT madr_fk_record, 'admin', 'admin' FROM main_dimension_record WHERE madr_id = @admin_id;

CALL stp_upsertDimension('sys.type', 'department', @dep_id);
INSERT INTO main_dimension_record VALUES (0, @dep_id, func_getDimensionID('sys.attr.code'), 0);
INSERT INTO main_dimension_record VALUES (0, @dep_id, func_getDimensionID('sys.attr.desc'), 0);
CALL stp_upsertRelation('sys.type.department', 'sys.type.department', @dep_dep_id);
CALL stp_upsertDimensionRecord('sys.type.department', 'afd-1', @dep_id);
CALL stp_upsertDimensionRecordValue(@dep_id, func_getDimensionID('sys.attr.desc'), 'sys.lang.nl', 'Afdeling 1', 0, @attr_id);

CALL stp_upsertDimension('sys.type', 'app', @app_id);
INSERT INTO main_dimension_record VALUES (0, @app_id, func_getDimensionID('sys.attr.desc'), 0);
CALL stp_upsertDimension('sys.type.app', 'item', @app_item_id);
INSERT INTO main_dimension_record VALUES (0, @app_item_id, func_getDimensionID('sys.attr.module'), 0);
INSERT INTO main_dimension_record VALUES (0, @app_item_id, func_getDimensionID('sys.attr.route'), 0);
INSERT INTO main_dimension_record VALUES (0, @app_item_id, func_getDimensionID('sys.attr.desc'), 0);
INSERT INTO main_dimension_record VALUES (0, @app_item_id, func_getDimensionID('sys.attr.icon'), 0);
INSERT INTO main_dimension_record VALUES (0, @app_item_id, func_getDimensionID('sys.attr.class'), 0);
INSERT INTO main_dimension_record VALUES (0, @app_item_id, func_getDimensionID('sys.event.click'), 0);
CALL stp_upsertRelation('sys.type.app.item', 'sys.type.app.item', @app_menu_item_id);

CALL stp_upsertDimensionRecord('sys.type.app.item', 'main', @menu_id);
CALL stp_upsertDimensionRecordValue(@menu_id, 'sys.attr.desc', 'sys.lang.nl', 'Hoofdmenu', 0, @attr_id);

CALL stp_upsertDimensionRecord('sys.type.app.item', 'system', @itm_id);
CALL stp_upsertDimensionRecordValue(@itm_id, 'sys.attr.desc', 'sys.lang.nl', 'Systeem', 0, @attr_id);
CALL stp_upsertRelationRecord(func_getDimensionID('sys.type.app.item.item'), @menu_id, func_getRecordID('sys.type.app.item', 'sys.attr.code', 'system'), 0, @rela_id);

CALL stp_upsertDimensionRecord('sys.type.app.item', 'admin/datamodel', @itm_id);
CALL stp_upsertDimensionRecordValue(@itm_id, 'sys.attr.desc', 'sys.lang.nl', 'Data Model', 0, @attr_id);
CALL stp_upsertRelationRecord(func_getDimensionID('sys.type.app.item.item'), func_getMadrId(CONCAT('mare_', @rela_id)), func_getRecordID('sys.type.app.item', 'sys.attr.code', 'admin/datamodel'), 0, @rela_subid);

CALL stp_upsertDimensionRecord('sys.type.app.item', 'admin/viewmodel', @itm_id);
CALL stp_upsertDimensionRecordValue(@itm_id, 'sys.attr.desc', 'sys.lang.nl', 'View Model', 0, @attr_id);
CALL stp_upsertDimensionRecordValue(@itm_id, 'sys.attr.module', 'sys.lang.nl', 'admin/datarecords', 0, @attr_id);
CALL stp_upsertRelationRecord(func_getDimensionID('sys.type.app.item.item'), func_getMadrId(CONCAT('mare_', @rela_id)), func_getRecordID('sys.type.app.item', 'sys.attr.code', 'admin/viewmodel'), 0, @rela_subid);

CALL stp_upsertDimensionRecord('sys.type.app.item', 'organisation', @itm_id);
CALL stp_upsertDimensionRecordValue(@itm_id, 'sys.attr.desc', 'sys.lang.nl', 'Organisatie', 0, @attr_id);
CALL stp_upsertRelationRecord(func_getDimensionID('sys.type.app.item.item'), @menu_id, func_getRecordID('sys.type.app.item', 'sys.attr.code', 'organisation'), 0, @rela_id);

CALL stp_upsertDimensionRecord('sys.type.app.item', 'admin/organigram', @itm_id);
CALL stp_upsertDimensionRecordValue(@itm_id, 'sys.attr.desc', 'sys.lang.nl', 'Organigram', 0, @attr_id);
CALL stp_upsertDimensionRecordValue(@itm_id, 'sys.attr.module', 'sys.lang.nl', 'admin/datarecords', 0, @attr_id);
CALL stp_upsertRelationRecord(func_getDimensionID('sys.type.app.item.item'), func_getMadrId(CONCAT('mare_', @rela_id)), func_getRecordID('sys.type.app.item', 'sys.attr.code', 'admin/organigram'), 0, @rela_subid);

CALL stp_upsertDimensionRecord('sys.type.app.item', 'account', @itm_id);
CALL stp_upsertDimensionRecordValue(@itm_id, 'sys.attr.desc', 'sys.lang.nl', 'Account', 0, @attr_id);
CALL stp_upsertDimensionRecordValue(@itm_id, 'sys.attr.class', 'sys', 'pull-right', 0, @attr_id);
CALL stp_upsertRelationRecord(func_getDimensionID('sys.type.app.item.item'), @menu_id, func_getRecordID('sys.type.app.item', 'sys.attr.code', 'account'), 0, @rela_id);

CALL stp_upsertDimensionRecord('sys.type.app.item', 'settings', @itm_id);
CALL stp_upsertDimensionRecordValue(@itm_id, 'sys.attr.desc', 'sys.lang.nl', 'Settings', 0, @attr_id);
CALL stp_upsertRelationRecord(func_getDimensionID('sys.type.app.item.item'), func_getMadrId(CONCAT('mare_', @rela_id)), func_getRecordID('sys.type.app.item', 'sys.attr.code', 'settings'), 0, @rela_subid);

CALL stp_upsertDimensionRecord('sys.type.app.item', 'logout', @itm_id);
CALL stp_upsertDimensionRecordValue(@itm_id, 'sys.attr.desc', 'sys.lang.nl', 'Logout', 0, @attr_id);
CALL stp_upsertDimensionRecordValue(@itm_id, 'sys.event.click', 'sys', 'handler', 0, @attr_id);
CALL stp_upsertRelationRecord(func_getDimensionID('sys.type.app.item.item'), func_getMadrId(CONCAT('mare_', @rela_id)), func_getRecordID('sys.type.app.item', 'sys.attr.code', 'logout'), 0, @rela_subid);

CALL stp_upsertDimension('sys.type', 'entity', @enti_id);
INSERT INTO main_dimension_record VALUES (0, @enti_id, func_getDimensionID('sys.attr.desc'), 0);

	INSERT INTO main_record_value (mava_id, mava_fk_record, mava_fk_dimension, mava_fk_language, mava_fk_value, mava_value)
	SELECT 0, mava_fk_record, func_getDimensionID('sys.attr.route'), 1, NULL, mava_value
	FROM main_dimension_record
	JOIN main_record_value AS mava ON mava_fk_record = madr_fk_record AND mava_fk_dimension = func_getDimensionID('sys.attr.code')
	LEFT JOIN main_relation_record ON marr_id = madr_fk_record
	WHERE madr_fk_dimension = func_getDimensionID('sys.type.app.item')
	AND NOT EXISTS (SELECT 1 FROM main_dimension WHERE madi_id = mava.mava_fk_record)
	AND NOT EXISTS (SELECT 1 FROM main_record_value WHERE mava_fk_record = mava.mava_fk_record AND mava_fk_dimension = func_getDimensionID('sys.attr.route'))
	AND marr_id IS NULL;

-- SELECT * FROM main_record_value WHERE mava_fk_dimension = func_getDimensionID('sys.attr.route');

CALL stp_upsertDimension('sys.type', 'option', @option_id);
CALL stp_upsertRecordValue(@option_id, func_getDimensionID('sys.attr.name'), 'sys', 'options', 0, @attr_id);

CALL stp_upsertDimension('sys.type', 'component', @comp_id);
INSERT INTO main_dimension_record VALUES (0, @comp_id, func_getDimensionID('sys.attr.code'), 0);
INSERT INTO main_dimension_record VALUES (0, @comp_id, func_getDimensionID('sys.attr.path'), 0);

CALL stp_upsertDimensionRecord('sys.type.component', 'nav-sidebar', @itm_id);
CALL stp_upsertDimensionRecordValue(@itm_id, func_getDimensionID('sys.attr.path'), 'sys', 'nav-sidebar', 0, @attr_id);

CALL stp_upsertDimension('sys.type', 'module', @mod_id);
INSERT INTO main_dimension_record VALUES (0, @mod_id, func_getDimensionID('sys.attr.code'), 0);
INSERT INTO main_dimension_record VALUES (0, @mod_id, func_getDimensionID('sys.attr.path'), 0);

CALL stp_upsertDimensionRecord('sys.type.module', 'tree-nav-generic', @itm_id);
CALL stp_upsertDimensionRecordValue(@itm_id, func_getDimensionID('sys.attr.path'), 'sys', 'modules/tree-nav-generic', 0, @attr_id);

CALL stp_upsertDimension('sys.type', 'endpoint', @endpoint_id);
INSERT INTO main_dimension_record VALUES (0, @endpoint_id, func_getDimensionID('sys.attr.code'), 0);
INSERT INTO main_dimension_record VALUES (0, @endpoint_id, func_getDimensionID('sys.attr.path'), 0);

CALL stp_upsertDimensionRecord('sys.type.endpoint', 'db.tree', @itm_id);
CALL stp_upsertDimensionRecordValue(@itm_id, func_getDimensionID('sys.attr.path'), 'sys', 'tree', 0, @attr_id);
CALL stp_upsertDimensionRecord('sys.type.endpoint', 'db.load', @itm_id);
CALL stp_upsertDimensionRecordValue(@itm_id, func_getDimensionID('sys.attr.path'), 'sys', 'load', 0, @attr_id);

CALL stp_upsertRelation('sys.type.entity', 'sys.type.item', @enti_type_id);
CALL stp_upsertRelation('sys.type.module', 'sys.type.endpoint', @mod_ep_id);
CALL stp_upsertRelationRecord(func_getDimensionID('sys.type.module.endpoint'), func_getRecordID('sys.type.module', 'sys.attr.code', 'tree-nav-generic'), func_getRecordID('sys.type.endpoint', 'sys.attr.code', 'db.tree'), 0, @rela_id);

CALL stp_upsertRelation('sys.type.module', 'sys.type.component', @mod_comp_id);
CALL stp_upsertRelationRecord(func_getDimensionID('sys.type.module.component'), func_getRecordID('sys.type.module', 'sys.attr.code', 'tree-nav-generic'), func_getRecordID('sys.type.component', 'sys.attr.code', 'nav-sidebar'), 0, @rela_id);

CALL stp_upsertRelation('sys.type.app.item.item', 'sys.type.module', @item_module_id);
CALL stp_upsertRelation('sys.type.app.item.item.module', 'sys.type.any', @module_any_id);
CALL stp_upsertRelation('sys.type.app.item.item.module', 'sys.type.endpoint', @module_endpoint_id);

/*
SELECT * FROM main_record_value WHERE mava_value LIKE 'sys.app%';

SELECT * FROM main_dimension ORDER BY madi_code;
SELECT * FROM main_record ORDER BY mare_id DESC;
SELECT * FROM main_record_value ORDER BY mava_id DESC;
SELECT * FROM main_dimension_record ORDER BY madr_id DESC;
SELECT * FROM main_relation_record ORDER BY marr_id DESC;

select func_getRelationID('madi_52', 'madi_54');

*/

