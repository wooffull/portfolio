"use strict";

var app = app || {};

(function () {
    app.IMAGES = Object.freeze({
        ship : "media/Ship.png",
        expandiumOrb : "media/ExpandiumItem.png",
        expandiumRing : "media/ExpandiumRing.png",
        healthOrbFull : "media/HealthOrbFull.png",
        healthOrbEmpty : "media/HealthOrbEmpty.png",
        powerUpBullet : "media/PowerUp_Bullet.png",
        fullBlock : "media/BlockFull.png",
        fullBlock2 : "media/BlockFull2.png",
        fullBlock3 : "media/BlockFull3.png",
        fullBlock4 : "media/BlockFull4.png",
        halfBlock : "media/BlockHalf.png",
        halfBlock2 : "media/BlockHalf2.png",
        halfBlock3 : "media/BlockHalf3.png",
        blockPillar : "media/BlockPillar5.png",
        blockPillarR : "media/BlockPillar5R.png",
        bgTile : "media/BG-tile1.png",
        weakBullet_1 : "media/BulletWeak_a.png",
        weakBullet_2 : "media/BulletWeak_b.png",
        weakBullet_3 : "media/BulletWeak_c.png",
        weakBullet_4 : "media/BulletWeak_d.png",
        drainer_1 : "media/Drainer_a.png",
        drainer_2 : "media/Drainer_b.png",
        reflict : "media/Reflict1.png",
        wallGel_1a : "media/WallGel1.png",
        wallGel_1b : "media/WallGel1_2.png",
        wallGel_2 : "media/WallGel2.png",
        ravageMite_1 : "media/RavageMite_a.png",
        ravageMite_2 : "media/RavageMite_b.png",
        ravageMite_3 : "media/RavageMite_c.png",
        absorber_1 : "media/Absorber_a.png",
        absorber_2 : "media/Absorber_b.png",
        absorber_3 : "media/Absorber_c.png",
        absorber_4 : "media/Absorber_d.png",
        spawnPoint : "media/SpawnPoint.png",
        env_Plants1 : "media/Env_plants1.png",
        env_Plants2a : "media/Env_plants2_a.png",
        env_Plants2b : "media/Env_plants2_b.png",
        env_Plants3a : "media/Env_plants3_a.png",
        env_Plants3b : "media/Env_plants3_b.png",
        env_Plants4a : "media/Env_plants4_a.png",
        env_Plants4b : "media/Env_plants4_b.png",
        env_Plants4c : "media/Env_plants4_c.png",
        env_Plants4d : "media/Env_plants4_d.png",
        env_Plants5a : "media/Env_plants5_a.png",
        env_Plants5b : "media/Env_plants5_b.png",
        env_Plants5c : "media/Env_plants5_c.png",
        env_Plants5d : "media/Env_plants5_d.png",
        exVisionist_left_1 : "media/ExVisionist_left_a.png",
        exVisionist_left_2 : "media/ExVisionist_left_b.png",
        exVisionist_left_3 : "media/ExVisionist_left_c.png",
        exVisionist_middle_1 : "media/ExVisionist_middle_a.png",
        exVisionist_middle_2 : "media/ExVisionist_middle_b.png",
        exVisionist_middle_3 : "media/ExVisionist_middle_c.png",
        exVisionist_right_1 : "media/ExVisionist_right_a.png",
        exVisionist_right_2 : "media/ExVisionist_right_b.png",
        exVisionist_right_3 : "media/ExVisionist_right_c.png",
        exVisionist_aggr_left_1 : "media/ExVisionist_aggr_left_a.png",
        exVisionist_aggr_middle_1 : "media/ExVisionist_aggr_middle_a.png",
        exVisionist_aggr_right_1 : "media/ExVisionist_aggr_right_a.png",
        exVisionistBullet : "media/ExVisionistBullet.png",
        notificationBox : "media/NotificationBox.png"
    });

    app.SOUNDS = Object.freeze({
        bgm_theme1 : "sounds/bgm_Theme1.ogg",
        se_findItem : "sounds/se_FindItem.ogg",
        se_shoot : "sounds/se_Shoot.ogg",
        se_pulse : "sounds/se_Pulse.ogg",
        se_crash : "sounds/se_Crash.ogg",
        se_exhaust : "sounds/se_Exhaust.ogg",
        se_explosion : "sounds/se_Explosion.ogg",
        se_pickup : "sounds/se_Pickup.ogg"
    });
})();