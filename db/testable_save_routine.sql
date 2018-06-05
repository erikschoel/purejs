use purejs_test;

CALL stp_startTransaction(@tran_id);
-- SELECT @tran_id AS tran_id;


-- {"record_id":476,"dimension":"sys.attr.code","language":19,"value":"afd-3","lookup":false} 
SET @record_id = 484, @dimension = 'sys.attr.code', @language = 19, @value = 'afd-122', @lookup = FALSE;
CALL stp_upsertDimensionRecordValue(@record_id, @dimension, @language, @value, @lookup, @val_id);


/***** -- "madr": 476, "marl": "madi_380", "marr": 484, "dbid": "mare_484" *****/

-- {"record_id":476,"dimension":"sys.attr.desc","language":19,"value":"Afdeling 3","lookup":false} 
SET @record_id = 484, @dimension = 'sys.attr.desc', @language = 19, @value = 'Afdeling 122', @lookup = FALSE;
CALL stp_upsertDimensionRecordValue(@record_id, @dimension, @language, @value, @lookup, @val_id);

-- {"dimension":"madi_380","code":"afd-3.1"} 
SET @dimension = 'madi_380', @code = 'afd-122';
CALL stp_upsertDimensionRecord(@dimension, @code, @rec_id);
SELECT @rec_id; -- == 485 = madr_id

SET @code = 'sys.attr.code';
				select
                    madr_id as id, mava_value as code, madr_fk_record as rec_id
                    from main_dimension_record
                        join main_record_value
                            on mava_fk_record = madr_fk_record
                           and mava_fk_dimension = func_getDimensionID(@code)
                           and mava_fk_language = 1
                    where madr_id = @rec_id;
                    -- {"code":"sys.attr.code"}

-- 485, afd-3.3, 493

SET @madi = 'madi_381', @parent = 492, @child = 484, @order = 0;
CALL stp_upsertRelationRecord(func_getDimensionID(@madi), func_getMadrID(@parent), @child, @order, @rel_id);
-- {"madi":"madi_381","parent":476,"child":481,"order":0} 

select @rel_id; -- ==> 490 == marr_id

-- 477 / 485


-- !!! 473 --> 476 !!! --- ==> FIXEN!

-- {"record_id":473,"dimension":"sys.attr.code","language":19,"value":"afd-3.1","lookup":false} 
SET @record_id = 492, @dimension = 'sys.attr.code', @language = 19, @value = 'afd-122', @lookup = FALSE;
CALL stp_upsertDimensionRecordValue(@record_id, @dimension, @language, @value, @lookup, @val_id);


-- {"record_id":473,"dimension":"sys.attr.desc","language":19,"value":"Afdeling 3.1","lookup":false} 
SET @record_id = 492, @dimension = 'sys.attr.desc', @language = 19, @value = 'Afdeling 122', @lookup = FALSE;
CALL stp_upsertDimensionRecordValue(@record_id, @dimension, @language, @value, @lookup, @val_id);


-- {"dimension":"madi_380","code":"afd-3.2"}
SET @dimension = 'madi_380', @code = 'afd-122';
CALL stp_upsertDimensionRecord(@dimension, @code, @rec_id);
SELECT @rel_id; -- ==> 490 == marr_id

SET @code = 'sys.attr.code';
				select
                    madr_id as id, mava_value as code, madr_fk_record as rec_id
                    from main_dimension_record
                        join main_record_value
                            on mava_fk_record = madr_fk_record
                           and mava_fk_dimension = func_getDimensionID(@code)
                           and mava_fk_language = 1
                    where madr_id = @rec_id;
                    -- {"code":"sys.attr.code"} 

-- 486, afd-3.4, 494

-- {"madi":"madi_381","parent":476,"child":483,"order":0} 
SET @madi = 'madi_381', @parent = 476, @child = 494, @order = 0;
CALL stp_upsertRelationRecord(func_getDimensionID(@madi), func_getMadrID(@parent), @child, @order, @rel_id);

select madr_id, madr_fk_record as marr_id from main_dimension_record where madr_fk_record = @rec_id;  
-- 478 / 486

-- !!! 478 ==> 486 !!! -- FIXEN!!!
-- {"record_id":475,"dimension":"sys.attr.code","language":19,"value":"afd-3.2","lookup":false} 
SET @record_id = 486, @dimension = 'sys.attr.code', @language = 19, @value = 'afd-3.4', @lookup = FALSE;
CALL stp_upsertDimensionRecordValue(@record_id, @dimension, @language, @value, @lookup, @val_id);

-- {"record_id":475,"dimension":"sys.attr.desc","language":19,"value":"Afdeling 3.2","lookup":false} 
SET @record_id = 486, @dimension = 'sys.attr.desc', @language = 19, @value = 'Afdeling-3.4', @lookup = FALSE;
CALL stp_upsertDimensionRecordValue(@record_id, @dimension, @language, @value, @lookup, @val_id);
-- {"record_id":475,"dimension":"sys.attr.desc","language":19,"value":"Afdeling 3.2","lookup":false} 

CALL stp_commitTransaction(@tran_id);
-- {"tran_id":13} 

SELECT func_getMadrID(@code) AS id;
-- {"code":"mare_484"} 

CALL stp_selectRecursive(476, 19,FALSE);
-- {"record_id":476,"lang":"sys.lang.nl","orderdim":false} 
