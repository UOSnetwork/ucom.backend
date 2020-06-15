# Entity images

Estimated time to implement - 2h per entity.

To add image(s) to any entity, please consider using a `entity_images` architectural feature.

**The steps to do this:**
* Create a new column using a migration - [example](../../migrations_knex_monolith/20190405081637-alter-comments-add-entity-images.js).
* *Optional:* add a new column to an appropriate ORM model.
* Extend an existing model interface by `ModelWithEntityImages.` The interface is [here](../../lib/entity-images/interfaces/model-interfaces.ts).
* Make it possible to add a `entity_images` field to the model during a creation process via [entity images input service](../../lib/entity-images/service/entity-image-input-service.ts).
* Make it possible to update a `entity_images` field (not yet implemented, TODO).
* Write the autotests - [example](../../test/integration/comments/comments-entity-images.test.ts).
* Add the `entity_images` field to the GraphQL client library and to the GraphQL backend application server.
* If there are any legacy fields to hold images then please don't forget to migrate existing images from these fields to the new field.

**Related code conventions:**
* Any other existing methods to store entity-related images are deprecated. Any new methods to store images are forbidden.
* Do not use a column name inside the code as a plain string. Use this method:
```
EntityImagesModelProvider.entityImagesColumn()
```
* Keep in mind that a concrete `entity_images` JSON structure is up to the client application.
It is not required to validate it somehow.
* To clear an existing `entity_images` value, please send empty object `{}.`

**Entity images structure example:**
```
{
   "article_title": [
      {
         "url":"https://backend.ucommunity.io/upload/main_image_filename-1545901400947.jpg",
         "type": "original",
      },
      {
         "url":"https://backend.ucommunity.io/upload/main_image_filename-123dadsada.jpg",
         "type": "resize",
         "size": '800x800',
      },
   ],
   "main_slider_gallery": [
      'slider_1': {
         "url":"https://backend.ucommunity.io/upload/main_image_filename-1545901400947.jpg",
         "type": "original",
         "position": 1,
      },
      {
         "url":"https://backend.ucommunity.io/upload/main_image_filename-1545901400947.jpg"
         "type": "original"
         "position": 1,
      },
   ],
}
```
