import { CATALOG_FIELD_CLASS_NAME } from "@/modules/catalog/components/catalog-item-form.model";

export function CatalogItemImageField({
  imageUrl,
  imageUploadError,
  isImageUploading,
  onImageUrlChange,
  onUploadImage,
}: {
  imageUrl: string;
  imageUploadError: string | null;
  isImageUploading: boolean;
  onImageUrlChange: (value: string) => void;
  onUploadImage: (file: File | undefined) => void;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_12rem]">
      <label className="block space-y-2.5">
        <span className="text-sm font-medium text-zinc-700">Фото товара</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={(event) => onUploadImage(event.target.files?.[0])}
          className="w-full rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-700 file:mr-4 file:rounded-xl file:border-0 file:bg-zinc-950 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:bg-zinc-100"
          required={!imageUrl}
        />
        <input
          name="imageUrl"
          type="text"
          value={imageUrl}
          onChange={(event) => onImageUrlChange(event.target.value)}
          placeholder="Ссылка появится после загрузки фото"
          className={CATALOG_FIELD_CLASS_NAME}
          required
          readOnly={isImageUploading}
        />
        {isImageUploading ? (
          <p className="text-xs leading-5 text-zinc-500">Загружаем фото...</p>
        ) : null}
        {imageUploadError ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {imageUploadError}
          </p>
        ) : null}
        <p className="text-xs leading-5 text-zinc-500">
          Фото обязательно для клиентского сайта и внутреннего сопоставления позиций.
        </p>
      </label>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt="Превью фото товара"
            className="h-48 w-full object-cover lg:h-full"
          />
        ) : (
          <div className="flex h-48 items-center justify-center px-4 text-center text-sm text-zinc-500 lg:h-full">
            Превью появится после ссылки на фото
          </div>
        )}
      </div>
    </div>
  );
}
