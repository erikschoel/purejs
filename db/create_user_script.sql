CREATE TABLE IF NOT EXISTS `purejs_gdpr`.`main_user` (
  `maus_id` INT UNSIGNED NOT NULL,
  `maus_username` VARCHAR(100) NOT NULL,
  `maus_password` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`maus_id`),
  CONSTRAINT `fk_maus_mare_01`
    FOREIGN KEY (`maus_id`)
    REFERENCES `purejs_gdpr`.`main_record` (`mare_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

CREATE TABLE IF NOT EXISTS `purejs_gdpr`.`main_person` (
  `mape_id` INT UNSIGNED NOT NULL,
  `mape_first_name` VARCHAR(45) NOT NULL,
  `mape_middle_name` VARCHAR(45) NULL,
  `mape_last_name` VARCHAR(150) NOT NULL,
  `mape_gender` TINYINT UNSIGNED NULL,
  `mape_salutation` VARCHAR(45) NULL,
  `mape_email` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`mape_id`),
  CONSTRAINT `fk_mape_mare_01`
    FOREIGN KEY (`mape_id`)
    REFERENCES `purejs_gdpr`.`main_record` (`mare_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

CALL stp_upsertMainRecord('main_user', 'admin', '', @mare_id);
insert into main_user values (@mare_id, 'admin', 'Erik!112');

CALL stp_upsertMainRecord('main_person', 'admin', '', @mare_id);
insert into main_person values (@mare_id, 'admin', 'Erik!112');

select * from main_record where mare_maintype = 'main_user';
select * from main_record where mare_id = 0;

CALL stp_upsertMainRecord('main_relation', 'admin', '', @mare_id);
insert into main_user values (@mare_id, 'admin', 'Erik!112');

CALL stp_upsertMainRelation(0, 149, @mare_id);

select * from main_record order by mare_id desc;
select @mare_id;

delete from main_record where mare_id = 150;




